/**
 * socketServer.js
 *
 * Handles real-time synchronisation:
 *   - join-room           teacher or student enters a room
 *   - leave-room          explicit leave (student presses Leave)
 *   - end-lecture         teacher ends the session, broadcasts to students
 *   - attention-update    student pushes live AI data every second
 *   - participants-updated server pushes the full participant list (with AI data)
 *   - disconnect          socket dropped — same as leave-room
 *
 * All REST APIs are untouched.
 * No MongoDB writes happen here.
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// ── In-memory participant registry ────────────────────────────────────────────
// Shape: { [roomCode]: Map<socketId, Participant> }
//
// Participant shape:
// {
//   id:              string  (socketId)
//   name:            string
//   role:            "teacher" | "student"
//   averageAttention: number   (0-100, students only)
//   attentionState:  string   e.g. "Attentive"
//   eyeStatus:       string   e.g. "Open"
//   headPosition:    string   e.g. "Center"
//   blinkCount:      number
//   faceStatus:      string   e.g. "Detected"
// }
// ─────────────────────────────────────────────────────────────────────────────
const rooms = {};

function defaultStudentMetrics() {
  return {
    averageAttention: 0,
    attentionState: "Unknown",
    eyeStatus: "Unknown",
    headPosition: "Unknown",
    blinkCount: 0,
    faceStatus: "Waiting",
  };
}

function getParticipants(roomCode) {
  if (!rooms[roomCode]) return [];
  return Array.from(rooms[roomCode].values());
}

function emitParticipants(io, roomCode) {
  io.to(roomCode).emit("participants-updated", getParticipants(roomCode));
}

function tryVerifyJwt(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] connected: ${socket.id}`);

    // ── join-room ─────────────────────────────────────────────────────────────
    // Payload: { roomCode, name, role, token? }
    socket.on("join-room", ({ roomCode, name, role, token }) => {
      if (!roomCode || !name || !role) return;

      const code = roomCode.toUpperCase();

      if (role === "teacher" && token) {
        const decoded = tryVerifyJwt(token);
        if (decoded) socket.data.user = decoded;
      }

      socket.data.roomCode = code;
      socket.data.name = name;
      socket.data.role = role;

      socket.join(code);

      if (!rooms[code]) rooms[code] = new Map();

      // Deduplicate by socketId — preserve existing AI data if reconnecting
      const existing = rooms[code].get(socket.id);
      rooms[code].set(socket.id, {
        id: socket.id,
        name,
        role,
        ...(role === "student" ? defaultStudentMetrics() : {}),
        // Keep previously-received AI metrics on reconnect
        ...(existing || {}),
        // Always refresh identity fields
        id: socket.id,
        name,
        role,
      });

      console.log(`[Socket] ${role} "${name}" joined room ${code}`);
      emitParticipants(io, code);
    });

    // ── attention-update ──────────────────────────────────────────────────────
    // Payload: { roomCode, data: { averageAttention, attentionState, eyeStatus,
    //                              headPosition, blinkCount, faceStatus } }
    // Sent by every student once per second while their camera is active.
    // The server merges the payload into the participant entry and re-broadcasts
    // the full participant list to the room (teacher sees the updated values).
    socket.on("attention-update", ({ roomCode, data }) => {
      if (!roomCode || !data) return;

      const code = roomCode.toUpperCase();
      if (!rooms[code]) return;

      const participant = rooms[code].get(socket.id);
      if (!participant || participant.role !== "student") return;

      // Merge incoming AI metrics — only whitelisted fields accepted
      rooms[code].set(socket.id, {
        ...participant,
        averageAttention: typeof data.averageAttention === "number" ? data.averageAttention : participant.averageAttention,
        attentionState:   typeof data.attentionState  === "string"  ? data.attentionState  : participant.attentionState,
        eyeStatus:        typeof data.eyeStatus       === "string"  ? data.eyeStatus       : participant.eyeStatus,
        headPosition:     typeof data.headPosition    === "string"  ? data.headPosition    : participant.headPosition,
        blinkCount:       typeof data.blinkCount      === "number"  ? data.blinkCount      : participant.blinkCount,
        faceStatus:       typeof data.faceStatus      === "string"  ? data.faceStatus      : participant.faceStatus,
      });

      // Broadcast updated list to everyone in the room (no extra events needed)
      emitParticipants(io, code);
    });

    // ── leave-room ────────────────────────────────────────────────────────────
    socket.on("leave-room", ({ roomCode }) => {
      handleLeave(socket, io, roomCode?.toUpperCase());
    });

    // ── end-lecture ───────────────────────────────────────────────────────────
    // Only the teacher emits this.
    socket.on("end-lecture", ({ roomCode }) => {
      if (!roomCode) return;
      const code = roomCode.toUpperCase();

      console.log(`[Socket] lecture ended in room ${code} by ${socket.data.name}`);

      // Broadcast to everyone else in the room (students redirect home)
      socket.to(code).emit("lecture-ended");

      // Clean up the room registry
      delete rooms[code];
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const code = socket.data.roomCode;
      if (code) handleLeave(socket, io, code);
      console.log(`[Socket] disconnected: ${socket.id}`);
    });
  });

  return io;
}

// ── Shared leave helper ───────────────────────────────────────────────────────
function handleLeave(socket, io, roomCode) {
  if (!roomCode || !rooms[roomCode]) return;

  rooms[roomCode].delete(socket.id);
  socket.leave(roomCode);

  if (rooms[roomCode].size === 0) {
    delete rooms[roomCode];
  } else {
    emitParticipants(io, roomCode);
  }

  console.log(`[Socket] "${socket.data.name}" left room ${roomCode}`);
}
