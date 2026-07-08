import mongoose from "mongoose";

const timelinePointSchema = new mongoose.Schema(
  {
    timestamp: Date,
    averageAttention: Number,
  },
  { _id: false }
);

// One student's individual analytics for a session, saved alongside the
// overall class report so the teacher can review each student separately.
const studentReportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    averageAttention: { type: Number, default: 0 },
    focusedPercentage: { type: Number, default: 0 },
    distractedPercentage: { type: Number, default: 0 },
    drowsyPercentage: { type: Number, default: 0 },
    blinkCount: { type: Number, default: 0 },
    attendanceDuration: { type: Number, default: 0 }, // seconds
    // Same {time, averageAttention, state} shape as the overall reportData,
    // just scoped to this one student.
    timeline: [
      {
        time: String,
        averageAttention: Number,
        state: String,
        _id: false,
      },
    ],
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    // BUGFIX: these were `required: true`, but the report-saving flow that is
    // actually wired up on the client (POST /api/reports → createReport)
    // never sends a session/room id — it saves straight from the live
    // Socket.IO session data. That mismatch meant Report.create() was
    // failing validation silently (the UI never surfaced it because the
    // Reports page renders from navigation state either way). Made optional
    // so the save actually persists; `sparse` keeps the unique index from
    // colliding across the many documents that now have no session id.
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: false,
      unique: true,
      sparse: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomName: String,
    roomCode: String,

    averageAttention: { type: Number, default: 0 },
    highestAttention: { type: Number, default: 0 },
    lowestAttention: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 }, // seconds
    studentCount: { type: Number, default: 0 },

    // Chronological list of {timestamp, averageAttention} snapshots
    timelineData: [timelinePointSchema],

    // Raw series suitable for plotting a graph on the frontend
    attentionGraphData: [
      {
        timestamp: Date,
        studentName: String,
        attention: Number,
        _id: false,
      },
    ],

    distractionCount: { type: Number, default: 0 },
    drowsyCount: { type: Number, default: 0 },
    blinkCount: { type: Number, default: 0 },

    headPoseStats: {
      center: { type: Number, default: 0 },
      left: { type: Number, default: 0 },
      right: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
    },

    faceDetectionStats: {
      detected: { type: Number, default: 0 },
      notDetected: { type: Number, default: 0 },
    },

    // Full raw data snapshot for CSV/PDF export on the frontend
    exportableData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // BUGFIX: individual analytics for every student who joined the
    // lecture, saved alongside the overall class summary above. Additive
    // field — defaults to [] so older Report documents remain valid.
    studentReports: {
      type: [studentReportSchema],
      default: [],
    },
  },
  { timestamps: true } // createdAt acts as "generatedAt"
);

const Report = mongoose.model("Report", reportSchema);

export default Report;

