import Room from "../models/Room.js";
import Session from "../models/Session.js";
import generateUniqueRoomCode from "../utils/generateRoomCode.js";
import generateReportForSession from "../utils/reportGenerator.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { requireFields, isValidRoomCode } from "../utils/validators.js";

/**
 * @desc    Create a new room (auto-generates a unique room code)
 * @route   POST /api/rooms/create
 * @access  Private (teacher)
 */
export const createRoom = asyncHandler(async (req, res) => {
  const { roomName } = req.body;

  requireFields(req.body, ["roomName"]);

  const roomCode = await generateUniqueRoomCode();

  const room = await Room.create({
    roomName,
    roomCode,
    teacher: req.user._id,
  });

  sendSuccess(res, 201, "Room created successfully", room);
});

/**
 * @desc    Get all rooms belonging to the logged-in teacher
 * @route   GET /api/rooms
 * @access  Private (teacher)
 */
export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });

  sendSuccess(res, 200, "Rooms fetched successfully", rooms);
});

/**
 * @desc    Student joins a room using a room code
 * @route   POST /api/rooms/join
 * @access  Public (students do not log in)
 */
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomCode, studentName } = req.body;

  requireFields(req.body, ["roomCode", "studentName"]);

  if (!isValidRoomCode(roomCode)) {
    throw new ApiError(400, "Invalid room code format");
  }

  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!room.isActive) {
    throw new ApiError(403, "This room is not currently active");
  }

  const nameTaken = room.students.some(
    (student) => student.name.toLowerCase() === studentName.trim().toLowerCase()
  );

  if (nameTaken) {
    throw new ApiError(409, "A student with this name has already joined the room");
  }

  room.students.push({ name: studentName.trim() });
  await room.save();

  // Also register the student against the active session, if one is running
  if (room.currentSession) {
    await Session.findByIdAndUpdate(room.currentSession, {
      $push: { students: { name: studentName.trim() } },
    });
  }

  sendSuccess(res, 200, "Joined room successfully", room);
});

/**
 * @desc    Get room details by room code
 * @route   GET /api/rooms/:roomCode
 * @access  Public
 */
export const getRoomByCode = asyncHandler(async (req, res) => {
  const room = await Room.findOne({
    roomCode: req.params.roomCode.toUpperCase(),
  }).populate("currentSession");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  sendSuccess(res, 200, "Room fetched successfully", room);
});

/**
 * @desc    Start a lecture session for a room
 * @route   POST /api/rooms/:roomCode/start
 * @access  Private (teacher, must own the room)
 */
export const startSession = asyncHandler(async (req, res) => {
  const room = await Room.findOne({
    roomCode: req.params.roomCode.toUpperCase(),
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this room");
  }

  if (room.isActive) {
    throw new ApiError(409, "A session is already active for this room");
  }

  const session = await Session.create({
    room: room._id,
    roomCode: room.roomCode,
    teacher: req.user._id,
    startTime: new Date(),
    students: room.students.map((s) => ({ name: s.name })),
  });

  room.isActive = true;
  room.currentSession = session._id;
  await room.save();

  sendSuccess(res, 200, "Lecture session started", { room, session });
});

/**
 * @desc    End the active lecture session for a room, auto-generate report
 * @route   POST /api/rooms/:roomCode/end
 * @access  Private (teacher, must own the room)
 */
export const endSession = asyncHandler(async (req, res) => {
  const room = await Room.findOne({
    roomCode: req.params.roomCode.toUpperCase(),
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to manage this room");
  }

  if (!room.isActive || !room.currentSession) {
    throw new ApiError(409, "No active session found for this room");
  }

  const session = await Session.findById(room.currentSession);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  const endTime = new Date();
  const duration = Math.round((endTime - session.startTime) / 1000); // seconds

  session.endTime = endTime;
  session.duration = duration;
  session.isActive = false;

  // Report is generated first so we can store its average attention on the session
  const report = await generateReportForSession(session, room);
  session.averageAttention = report.averageAttention;
  session.report = report._id;
  await session.save();

  room.isActive = false;
  room.currentSession = null;
  await room.save();

  sendSuccess(res, 200, "Lecture session ended and report generated", {
    session,
    report,
  });
});

/**
 * @desc    Delete a room (and its association, keeps historical reports intact)
 * @route   DELETE /api/rooms/:id
 * @access  Private (teacher, must own the room)
 */
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this room");
  }

  if (room.isActive) {
    throw new ApiError(409, "Cannot delete a room with an active session. End the session first.");
  }

  await room.deleteOne();

  sendSuccess(res, 200, "Room deleted successfully", null);
});