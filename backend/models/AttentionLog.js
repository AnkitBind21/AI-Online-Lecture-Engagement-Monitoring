import mongoose from "mongoose";

// Stores every per-second attention reading sent by the frontend
// for every student in a room during a live session.
const attentionLogSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attention: {
      // Attention percentage 0-100
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    eyeStatus: {
      type: String, // e.g. "Open", "Closed"
      default: "Unknown",
    },
    headDirection: {
      type: String, // e.g. "Center", "Left", "Right", "Down"
      default: "Unknown",
    },
    blinkCount: {
      type: Number,
      default: 0,
    },
    faceStatus: {
      type: String, // e.g. "Detected", "Not Detected"
      default: "Unknown",
    },
    state: {
      type: String, // e.g. "Focused", "Distracted", "Drowsy"
      default: "Unknown",
    },
  },
  { timestamps: false }
);

// Speeds up queries used when building reports for a session
attentionLogSchema.index({ session: 1, timestamp: 1 });

const AttentionLog = mongoose.model("AttentionLog", attentionLogSchema);

export default AttentionLog;