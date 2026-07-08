
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/rooms`;

// ── Create a room (teacher, authenticated) ────────────────────────────────────
export const createRoom = async (roomName) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API}/create`,
    { roomName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ── Student joins a room via REST (persists name to MongoDB) ──────────────────
export const joinRoomApi = async (roomCode, studentName) => {
  const response = await axios.post(`${API}/join`, {
    roomCode,
    studentName,
  });

  return response.data;
};

// ── Alias kept for any existing callers of the old "joinRoom" export ──────────
export const joinRoom = joinRoomApi;

// ── Fetch room details by room code ──────────────────────────────────────────
export const getRoom = async (roomCode) => {
  const response = await axios.get(`${API}/${roomCode}`);
  return response.data;
};
