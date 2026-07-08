import Room from "../models/Room.js";
import AttentionLog from "../models/AttentionLog.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendSuccess, ApiError } from "../utils/apiResponse.js";
import { requireFields, isValidRoomCode } from "../utils/validators.js";

/**
 * @desc    Record one attention reading for a student (sent every second)
 * @route   POST /api/attention
 * @access  Public (called directly from the student's browser tab)
 *
 * Expected body:
 * {
 *   studentName, roomCode, attention, eyeStatus,
 *   headDirection, blinkCount, faceStatus, state
 * }
 */
export const recordAttention = asyncHandler(async (req, res) => {
  const {
    studentName,
    roomCode,
    attention,
    eyeStatus,
    headDirection,
    blinkCount,
    faceStatus,
    state,
  } = req.body;

  requireFields(req.body, ["studentName", "roomCode", "attention"]);

  if (!isValidRoomCode(roomCode)) {
    throw new ApiError(400, "Invalid room code format");
  }

  if (typeof attention !== "number" || attention < 0 || attention > 100) {
    throw new ApiError(400, "attention must be a number between 0 and 100");
  }

  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!room.isActive || !room.currentSession) {
    throw new ApiError(403, "Room does not have an active lecture session");
  }

  const log = await AttentionLog.create({
    session: room.currentSession,
    room: room._id,
    roomCode: room.roomCode,
    studentName: studentName.trim(),
    timestamp: new Date(),
    attention,
    eyeStatus,
    headDirection,
    blinkCount,
    faceStatus,
    state,
  });

  sendSuccess(res, 201, "Attention data recorded", log);
});