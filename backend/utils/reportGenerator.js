import AttentionLog from "../models/AttentionLog.js";
import Report from "../models/Report.js";

/**
 * generateReportForSession
 * Reads every AttentionLog row recorded during a session and aggregates
 * it into a single Report document (averages, highs/lows, distraction &
 * drowsiness counts, head-pose stats, face-detection stats, a timeline
 * suitable for graphing, and a raw exportable snapshot).
 *
 * Called automatically by roomController.endSession().
 */
const generateReportForSession = async (session, room) => {
  const logs = await AttentionLog.find({ session: session._id }).sort({
    timestamp: 1,
  });

  const studentNames = new Set(logs.map((log) => log.studentName));
  const studentCount = studentNames.size || session.students.length;

  let averageAttention = 0;
  let highestAttention = 0;
  let lowestAttention = 100;
  let distractionCount = 0;
  let drowsyCount = 0;
  let blinkCount = 0;

  const headPoseStats = { center: 0, left: 0, right: 0, down: 0 };
  const faceDetectionStats = { detected: 0, notDetected: 0 };

  // timestamp (rounded to the second) -> { sum, count }
  const timelineBuckets = new Map();

  if (logs.length > 0) {
    let attentionSum = 0;

    logs.forEach((log) => {
      attentionSum += log.attention;
      highestAttention = Math.max(highestAttention, log.attention);
      lowestAttention = Math.min(lowestAttention, log.attention);
      blinkCount += log.blinkCount || 0;

      const state = (log.state || "").toLowerCase();
      if (state.includes("distract")) distractionCount += 1;
      if (state.includes("drowsy")) drowsyCount += 1;

      const direction = (log.headDirection || "").toLowerCase();
      if (direction.includes("center")) headPoseStats.center += 1;
      else if (direction.includes("left")) headPoseStats.left += 1;
      else if (direction.includes("right")) headPoseStats.right += 1;
      else if (direction.includes("down")) headPoseStats.down += 1;

      const face = (log.faceStatus || "").toLowerCase();
      if (face.includes("not")) faceDetectionStats.notDetected += 1;
      else if (face.includes("detect")) faceDetectionStats.detected += 1;

      const bucketKey = new Date(log.timestamp).setMilliseconds(0);
      const bucket = timelineBuckets.get(bucketKey) || { sum: 0, count: 0 };
      bucket.sum += log.attention;
      bucket.count += 1;
      timelineBuckets.set(bucketKey, bucket);
    });

    averageAttention = Number((attentionSum / logs.length).toFixed(2));
  } else {
    lowestAttention = 0;
  }

  const timelineData = Array.from(timelineBuckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, bucket]) => ({
      timestamp: new Date(timestamp),
      averageAttention: Number((bucket.sum / bucket.count).toFixed(2)),
    }));

  const attentionGraphData = logs.map((log) => ({
    timestamp: log.timestamp,
    studentName: log.studentName,
    attention: log.attention,
  }));

  const report = await Report.create({
    session: session._id,
    room: room._id,
    teacher: room.teacher,
    roomName: room.roomName,
    roomCode: room.roomCode,
    averageAttention,
    highestAttention,
    lowestAttention,
    sessionDuration: session.duration,
    studentCount,
    timelineData,
    attentionGraphData,
    distractionCount,
    drowsyCount,
    blinkCount,
    headPoseStats,
    faceDetectionStats,
    exportableData: {
      roomName: room.roomName,
      roomCode: room.roomCode,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      students: Array.from(studentNames),
      logs: attentionGraphData,
    },
  });

  return report;
};

export default generateReportForSession;