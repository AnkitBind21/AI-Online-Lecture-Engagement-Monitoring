
import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  PhoneOff,
  LogOut,
  Copy,
  Check,
  Brain,
  Clock,
  Activity,
  Eye,
  AlertTriangle,
  Home,
  GraduationCap,
} from "lucide-react";
import VideoGrid from "../../components/VideoGrid/VideoGrid";
import StudentCard from "../../components/StudentCard/StudentCard";
import {
  initializeFaceDetector,
  getFaceLandmarker,
  detectFace,
  getEyeStatus,
} from "../../utils/faceDetector";
import socket from "../../socket/socket";

function LectureRoom() {
  const streamRef             = useRef(null);
  const videoRef              = useRef(null);
  const detectorInitialized   = useRef(false);
  const animationFrameRef     = useRef(null);
  const cameraStartingRef     = useRef(false); // BUGFIX 1: guards against re-entrant Start Camera clicks
  const endingRef             = useRef(false); // BUGFIX 4: guarantees the report is generated exactly once
  const navigate              = useNavigate();
  const location              = useLocation();

  console.log(location.state);

  const role        = location.state?.role        || "student";
  const roomCode    = location.state?.roomCode    || "";
  const studentName = location.state?.studentName || "Student";

  // ── UI state ──────────────────────────────────────────────────────────────
  const [cameraOn,      setCameraOn]      = useState(false);
  const [micOn,         setMicOn]         = useState(false);
  const [screenShare,   setScreenShare]   = useState(false);
  const [showChat,      setShowChat]      = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [lectureEnded,  setLectureEnded]  = useState(false);

  // ── AI analytics state (own user) ────────────────────────────────────────
  const [faceStatus,      setFaceStatus]      = useState("Waiting for Face");
  const [headPosition,    setHeadPosition]    = useState("Unknown");
  const [eyeStatus,       setEyeStatus]       = useState("Unknown");
  const [attentionState,  setAttentionState]  = useState("Unknown");
  const [sessionTime,     setSessionTime]     = useState(0);
  const [sessionActive,   setSessionActive]   = useState(false);
  const [averageAttention,setAverageAttention]= useState(0);
  const [blinkCount,      setBlinkCount]      = useState(0);

  // ── Participants (socket-driven, includes AI data for students) ───────────
  const [participants, setParticipants] = useState([]);

  // ── Existing computation refs ─────────────────────────────────────────────
  const eyeClosedStartRef    = useRef(null);
  const totalScoreRef        = useRef(0);
  const scoreCountRef        = useRef(0);
  const currentScoreRef      = useRef(100);
  const attentionHistoryRef  = useRef([]);
  const lastSampleTimeRef    = useRef(0);

  // BUGFIX 3/4: teacher has no camera/face-detection of their own, so the
  // report timeline for a teacher must be built from the live student data
  // arriving over Socket.IO ("participants"), sampled the same way
  // attentionHistoryRef samples the student's own detection above.
  const teacherHistoryRef     = useRef([]);
  const lastTeacherSampleRef  = useRef(0);

  // ── BUGFIX: per-student analytics accumulation ────────────────────────────
  // teacherHistoryRef (above) only ever stores the CLASS-WIDE average per
  // 5-second tick — each individual student's numbers are averaged together
  // and then discarded, so nothing per-student was ever retained anywhere.
  // studentAnalyticsRef fixes that by keeping a running record PER STUDENT
  // NAME, sampled at the same cadence as teacherHistoryRef, so every
  // student's own timeline/averages survive until the report is built.
  // Shape: { [studentName]: { name, timeline: [], attentionSum, sampleCount,
  //          focusedCount, distractedCount, drowsyCount, blinkCount,
  //          firstSeen, lastSeen } }
  const studentAnalyticsRef   = useRef({});

  // ── Mirror-refs for attention-update emit (avoids stale closure) ──────────
  // Updated in sync with each state setter inside runFaceDetection.
  const attentionStateRef  = useRef("Unknown");
  const eyeStatusRef       = useRef("Unknown");
  const headPositionRef    = useRef("Unknown");
  const faceStatusRef      = useRef("Waiting for Face");
  const blinkCountRef      = useRef(0);
  // averageAttention is derived from totalScoreRef / scoreCountRef — computed
  // inline when emitting rather than kept as a separate ref.

  // ── SOCKET: connect on mount, clean up on unmount ────────────────────────
  useEffect(() => {
    if (!roomCode) return;

    if (!socket.connected) socket.connect();

    const token       = role === "teacher" ? localStorage.getItem("token") : undefined;
    const displayName = role === "teacher"
      ? (localStorage.getItem("teacherName") || "Teacher")
      : studentName;

    socket.emit("join-room", { roomCode, name: displayName, role, token });

    // BUGFIX 3/4: the teacher never toggles their own camera on, and
    // sessionActive/sessionTime were previously only started by startCamera().
    // That meant the teacher's session clock (and therefore sessionTime in
    // the final report) stayed at 0 the entire lecture. Start the clock for
    // the teacher as soon as they enter the room; students still only start
    // it when they start their camera (unchanged).
    if (role === "teacher") {
      setSessionActive(true);
    }

    socket.on("participants-updated", (list) => {
      setParticipants(list);
    });

    socket.on("lecture-ended", () => {
      stopCamera();
      setSessionActive(false);
      setLectureEnded(true);
    });

    return () => {
      socket.emit("leave-room", { roomCode });
      socket.off("participants-updated");
      socket.off("lecture-ended");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, role, studentName]);

  // ── FEATURE 1: student emits live AI data every second ───────────────────
  // Runs whenever sessionTime ticks (i.e. every second while sessionActive).
  // Uses refs so values are always current regardless of closure age.
  useEffect(() => {
    if (role !== "student" || !cameraOn || !roomCode) return;

    const currentAvg = Math.round(
      totalScoreRef.current / Math.max(scoreCountRef.current, 1)
    );

    socket.emit("attention-update", {
      roomCode,
      data: {
        averageAttention: currentAvg,
        attentionState:   attentionStateRef.current,
        eyeStatus:        eyeStatusRef.current,
        headPosition:     headPositionRef.current,
        blinkCount:       blinkCountRef.current,
        faceStatus:       faceStatusRef.current,
      },
    });
  }, [sessionTime, role, cameraOn, roomCode]);

  // ── MediaPipe init ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDetector = async () => {
      if (!detectorInitialized.current) {
        try {
          await initializeFaceDetector();
          detectorInitialized.current = true;
          console.log("MediaPipe initialized");
        } catch (error) {
          console.error("MediaPipe Error:", error);
        }
      }
    };

    loadDetector();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ── Session timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return;

    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive]);

  // ── Average attention calculation (student's own camera) ─────────────────
  // BUGFIX 2: this effect used to list `averageAttention` (a value it sets
  // itself) and `attentionState` in its dependency array. Because the effect
  // calls setAverageAttention(), including averageAttention in the deps made
  // the effect re-trigger itself on every render, and attentionState changes
  // (which can happen many times a second as the face moves) triggered extra
  // accumulations too. That over-fired the accumulation far faster than the
  // intended "once per second" cadence, which is why COUNT kept climbing
  // while AVG/TOTAL never reflected the real score. It should only
  // accumulate once per second tick, driven purely by sessionTime.
  // BUGFIX 5: gated to `role === "student"` — this ref-based accumulation is
  // fed by the local camera/MediaPipe loop, so it must never drive the
  // teacher's Average Attention (see the participants-driven effect below).
  useEffect(() => {
    if (role !== "student" || !cameraOn || sessionTime === 0) return;

    totalScoreRef.current  += currentScoreRef.current;
    scoreCountRef.current  += 1;

    const avg = Math.round(totalScoreRef.current / scoreCountRef.current);
    setAverageAttention(avg);

    console.log("AVG:", avg, "TOTAL:", totalScoreRef.current, "COUNT:", scoreCountRef.current);
  }, [sessionTime, cameraOn, role]);

  // ── BUGFIX 5: teacher's Average Attention comes from connected students ──
  // The teacher's own camera is optional and must never be the source of the
  // displayed/reported average. Whenever the live participants list updates
  // (driven by each student's "attention-update" broadcast), recompute the
  // average across all currently-connected students and use that as the
  // teacher's averageAttention.
  useEffect(() => {
    if (role !== "teacher") return;

    const activeStudents = participants.filter((p) => p.role === "student");
    const avg = activeStudents.length > 0
      ? Math.round(
          activeStudents.reduce((sum, s) => sum + (s.averageAttention || 0), 0) /
          activeStudents.length
        )
      : 0;

    setAverageAttention(avg);
  }, [participants, role]);

  // ── Attention history sampling (every 5 s) ────────────────────────────────
  useEffect(() => {
    if (
      sessionTime > 0 &&
      sessionTime % 5 === 0 &&
      sessionTime !== lastSampleTimeRef.current
    ) {
      lastSampleTimeRef.current = sessionTime;

      attentionHistoryRef.current.push({
        time: formatTime(sessionTime),
        averageAttention: Math.round(
          totalScoreRef.current / Math.max(scoreCountRef.current, 1)
        ),
        state: attentionState,
      });

      console.log("History Saved:", attentionHistoryRef.current);
    }
  }, [sessionTime]);

  // ── BUGFIX 3/4: teacher-side history sampling (every 5 s) ────────────────
  // Mirrors the student sampling effect above, but sources its numbers from
  // the live "participants" list (populated by Socket.IO attention-update
  // broadcasts) instead of local face-detection refs, since the teacher's
  // own camera/detection refs are never populated.
  useEffect(() => {
    if (role !== "teacher") return;
    if (
      sessionTime > 0 &&
      sessionTime % 5 === 0 &&
      sessionTime !== lastTeacherSampleRef.current
    ) {
      lastTeacherSampleRef.current = sessionTime;

      const activeStudents = participants.filter((p) => p.role === "student");
      const avgNow = activeStudents.length > 0
        ? Math.round(
            activeStudents.reduce((sum, s) => sum + (s.averageAttention || 0), 0) /
            activeStudents.length
          )
        : 0;

      // Most common attentionState among students right now, for the row's state label
      const stateCounts = activeStudents.reduce((acc, s) => {
        const key = s.attentionState || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const dominantState =
        Object.keys(stateCounts).sort((a, b) => stateCounts[b] - stateCounts[a])[0] ||
        "Unknown";

      teacherHistoryRef.current.push({
        time: formatTime(sessionTime),
        averageAttention: avgNow,
        state: dominantState,
      });

      // BUGFIX: alongside the class-wide sample above, also record each
      // individual student's own reading this tick, keyed by name, so their
      // analytics survive independently instead of being averaged away.
      activeStudents.forEach((s) => {
        const existing = studentAnalyticsRef.current[s.name];
        const rec = existing || {
          name: s.name,
          timeline: [],
          attentionSum: 0,
          sampleCount: 0,
          focusedCount: 0,
          distractedCount: 0,
          drowsyCount: 0,
          blinkCount: 0,
          firstSeen: sessionTime,
          lastSeen: sessionTime,
        };

        const studentAttention = s.averageAttention || 0;
        const studentState     = (s.attentionState || "Unknown");
        const stateLower       = studentState.toLowerCase();

        rec.timeline.push({
          time: formatTime(sessionTime),
          averageAttention: studentAttention,
          state: studentState,
        });
        rec.attentionSum += studentAttention;
        rec.sampleCount  += 1;
        if (stateLower.includes("distract")) rec.distractedCount += 1;
        else if (stateLower.includes("drowsy")) rec.drowsyCount += 1;
        else if (stateLower.includes("attent") || stateLower.includes("focus")) rec.focusedCount += 1;
        // blinkCount arrives as a running cumulative total from the student,
        // so keep the latest (max) value rather than summing samples.
        rec.blinkCount = Math.max(rec.blinkCount, s.blinkCount || 0);
        rec.lastSeen   = sessionTime;

        studentAnalyticsRef.current[s.name] = rec;
      });

      console.log("Teacher History Saved:", teacherHistoryRef.current);
      console.log("Per-Student Analytics:", studentAnalyticsRef.current);
    }
  }, [sessionTime, role, participants]);

  // ── Student auto-redirect after lecture ends ──────────────────────────────
  useEffect(() => {
    if (!lectureEnded) return;

    const timer = setTimeout(() => {
      navigate("/");
    }, 4000);

    return () => clearTimeout(timer);
  }, [lectureEnded, navigate]);

  // ── Face detection loop ───────────────────────────────────────────────────
  const runFaceDetection = useCallback(() => {
    const faceLandmarker = getFaceLandmarker();

    console.log("READY STATE:", videoRef.current?.readyState);
    if (
      faceLandmarker &&
      videoRef.current &&
      videoRef.current.readyState >= 2
    ) {
      const results = detectFace(
        faceLandmarker,
        videoRef.current,
        performance.now()
      );

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        // ── Face detected ──────────────────────────────────────────────────
        const detected = "Detected";
        setFaceStatus(detected);
        faceStatusRef.current = detected;

        const landmarks = results.faceLandmarks[0];

        const eyeState = getEyeStatus(landmarks);
        setEyeStatus(eyeState);
        eyeStatusRef.current = eyeState;

        if (eyeState === "Closed") {
          if (!eyeClosedStartRef.current) {
            eyeClosedStartRef.current = Date.now();
          }
        } else {
          if (eyeClosedStartRef.current) {
            setBlinkCount((prev) => {
              const next = prev + 1;
              blinkCountRef.current = next;
              return next;
            });
          }
          eyeClosedStartRef.current = null;
        }

        const nose  = landmarks[1];
        const noseX = nose.x;
        const noseY = nose.y;

        let currentHeadPosition = "Center";
        if (noseX < 0.42)      currentHeadPosition = "Looking Left";
        else if (noseX > 0.58) currentHeadPosition = "Looking Right";
        else if (noseY < 0.4)  currentHeadPosition = "Looking Up";
        else if (noseY > 0.6)  currentHeadPosition = "Looking Down";

        setHeadPosition(currentHeadPosition);
        headPositionRef.current = currentHeadPosition;

        let currentAttentionState = "Attentive";
        let score                 = 100;

        if (
          eyeClosedStartRef.current &&
          (Date.now() - eyeClosedStartRef.current) / 1000 > 2
        ) {
          currentAttentionState = "Drowsy";
          score = 40;
        } else if (currentHeadPosition !== "Center") {
          currentAttentionState = "Distracted";
          score = 70;
        }

        currentScoreRef.current = score;
        setAttentionState(currentAttentionState);
        attentionStateRef.current = currentAttentionState;

        console.log("Score:", score, "Total:", totalScoreRef.current, "Count:", scoreCountRef.current);

      } else {
        // ── No face detected ───────────────────────────────────────────────
        const notDetected = "Not Detected";
        setFaceStatus(notDetected);
        faceStatusRef.current = notDetected;

        setHeadPosition("Unknown");
        headPositionRef.current = "Unknown";

        setAttentionState("Absent");
        attentionStateRef.current = "Absent";

        setEyeStatus("Unknown");
        eyeStatusRef.current = "Unknown";

        currentScoreRef.current = 0;
      }
    }

    animationFrameRef.current = requestAnimationFrame(runFaceDetection);
  }, []);

  // ── Camera controls ───────────────────────────────────────────────────────
  const startCamera = async () => {
    // BUGFIX 1: without this guard, a fast double-click (or a re-render
    // triggered by the new Socket.IO participants-updated events firing
    // while the getUserMedia permission prompt is still pending) could call
    // startCamera() a second time before the first call finished, opening a
    // second camera stream and starting a second runFaceDetection loop.
    if (cameraStartingRef.current) return;
    cameraStartingRef.current = true;

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const preferredCamera =
          devices.find(
            d =>
              d.kind === "videoinput" &&
              !d.label.includes("OBS")
          );

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: {
              exact: preferredCamera.deviceId,
            },
          },
          audio: false,
        });

        console.log(
          "Camera opened:",
          stream.getVideoTracks()[0].label
        );

        const track = stream.getVideoTracks()[0];

        console.log("Camera opened:", track.label);
        console.log(track.getSettings());

      console.log("Camera stream started");

      streamRef.current = stream;
      setCameraOn(true);

      if (!sessionActive) setSessionActive(true);

      // BUGFIX 1: attaching the stream used to run inside a single
      // requestAnimationFrame callback that silently did nothing if
      // videoRef.current wasn't mounted yet on that exact frame (this can
      // happen when extra Socket.IO-driven re-renders delay the video
      // element mounting). Retry across frames instead of giving up after
      // one attempt, so the camera reliably starts every time.
      const attachStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play();

            // Prevent duplicate detection loops if this ever fires twice
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }

            console.log("runFaceDetection running");
            runFaceDetection();
          };
        } else {
          requestAnimationFrame(attachStream);
        }
      };

      requestAnimationFrame(attachStream);
    } catch (err) {
      console.error(err);
    } finally {
      cameraStartingRef.current = false;
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setCameraOn(false);
    setFaceStatus("Not Detected");
    setHeadPosition("Unknown");
    setEyeStatus("Unknown");
    setAttentionState("Unknown");
  };

  function formatTime(seconds) {
    const hrs  = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  const toggleCamera = async () => {
    console.log("TOGGLE CLICKED, cameraOn =", cameraOn);
    if (cameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── FEATURE 2: student Leave Lecture ─────────────────────────────────────
  const leaveLecture = () => {
    // stop camera (also halts the MediaPipe/runFaceDetection loop via stopCamera)
    stopCamera();
    setSessionActive(false);
    // leave socket room, then disconnect socket
    socket.emit("leave-room", { roomCode });
    socket.disconnect();
    // return home
    navigate("/");
  };

  // ── FEATURE 3: teacher End Lecture ────────────────────────────────────────
  const endMeeting = async () => {
    // BUGFIX 4: guarantee the report is generated/saved exactly once, even
    // if the End Lecture button (header + toolbar both call this) is
    // clicked more than once.
    if (endingRef.current) return;
    endingRef.current = true;

    // BUGFIX 3: previously this always used attentionHistoryRef, which is
    // only ever populated by the current user's OWN face detection loop.
    // The teacher (who calls endMeeting) doesn't run their own face
    // detection, so their attentionHistoryRef was always empty — the report
    // never actually contained the students' analytics. Use the
    // teacher-side history (sourced from live student Socket.IO data)
    // when the teacher ends the lecture, and fall back to the local
    // history for the rare case a student ends it.
    const reportData = [
      ...(role === "teacher" ? teacherHistoryRef.current : attentionHistoryRef.current),
    ];
    const finalAverageAttention = averageAttention;
    const finalSessionTime      = sessionTime;
    const participatingStudents = studentParticipants.map((p) => p.name);

    // BUGFIX: build the per-student breakdown from studentAnalyticsRef
    // (populated every 5s alongside teacherHistoryRef above) so the report
    // carries each student's own analytics, not just the class-wide average.
    const studentReports = Object.values(studentAnalyticsRef.current).map((rec) => {
      const samples = rec.sampleCount || 1;
      return {
        name: rec.name,
        averageAttention: Math.round(rec.attentionSum / samples),
        focusedPercentage: Math.round((rec.focusedCount / samples) * 100),
        distractedPercentage: Math.round((rec.distractedCount / samples) * 100),
        drowsyPercentage: Math.round((rec.drowsyCount / samples) * 100),
        blinkCount: rec.blinkCount,
        attendanceDuration: Math.max(0, rec.lastSeen - rec.firstSeen),
        timeline: rec.timeline,
      };
    });

    console.log("Final Session Report", reportData);
    console.log("Final Per-Student Reports", studentReports);

    stopCamera();
    setSessionActive(false);

    // Broadcast lecture-ended to all students
    socket.emit("end-lecture", { roomCode });
    socket.emit("leave-room",  { roomCode });

    try {
      // BUGFIX 4: the report-save request had no Authorization header, so
      // the backend's auth middleware rejected it. Read the same JWT the
      // rest of the app already stores in localStorage and send it as a
      // Bearer token, matching how reportService.js authorises its calls.
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        {
          averageAttention: finalAverageAttention,
          sessionTime:      finalSessionTime,
          reportData,
          students:         participatingStudents,
          studentReports,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      console.log("✅ Report Saved Successfully");
    } catch (error) {
      console.error("❌ Error Saving Report:", error);
    }

    navigate("/reports", {
      state: {
        reportData,
        averageAttention: finalAverageAttention,
        sessionTime:      finalSessionTime,
        students:         participatingStudents,
        studentReports,
      },
    });
  };

  // ── Derived UI values ─────────────────────────────────────────────────────
  const attentionColor =
    averageAttention >= 80 ? "text-green-400"
    : averageAttention >= 60 ? "text-yellow-400"
    : "text-red-400";

  const stateColor =
    attentionState === "Attentive"  ? "text-green-400"
    : attentionState === "Distracted" ? "text-yellow-400"
    : attentionState === "Drowsy"     ? "text-red-400"
    : "text-gray-400";

  const teacherParticipant  = participants.find((p) => p.role === "teacher");
  const studentParticipants = participants.filter((p) => p.role === "student");

  // ── Student end-of-lecture screen ────────────────────────────────────────
  if (lectureEnded && role === "student") {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
            <GraduationCap size={36} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Lecture Ended</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            The teacher has ended the lecture.
            <br />
            Thank you for attending.
          </p>
          <div className="flex items-center gap-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-gray-500">
              Redirecting to Home in a few seconds…
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <Home size={15} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Main lecture room ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Left: video area ── */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {role === "teacher" ? "Teacher" : "Student"} Lecture Room
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs font-mono tracking-widest text-purple-400">
                    {roomCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {formatTime(sessionTime)}
                </span>
              </div>
            </div>

            {/* FEATURE 2 & 3: role-split header action button */}
            {role === "teacher" ? (
              <button
                onClick={endMeeting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-200"
              >
                <PhoneOff size={16} />
                <span className="hidden sm:inline">End Lecture</span>
              </button>
            ) : (
              <button
                onClick={leaveLecture}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Leave Lecture</span>
              </button>
            )}
          </div>

          {/* Video */}
          <div className="flex-1 glass-card rounded-2xl border border-white/5 overflow-hidden relative min-h-[300px]">
            <VideoGrid videoRef={videoRef} cameraOn={cameraOn}>
              {role === "teacher" && (
                <div className="absolute top-4 left-4 glass rounded-xl px-3 py-1.5 border border-white/5">
                  <span className="text-xs font-medium text-purple-400">Teacher</span>
                </div>
              )}

              {/* Toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    micOn ? "glass hover:bg-white/10" : "bg-red-500/20 text-red-400"
                  }`}
                  title={micOn ? "Mute" : "Unmute"}
                >
                  {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    cameraOn ? "glass hover:bg-white/10" : "bg-red-500/20 text-red-400"
                  }`}
                  title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                  onClick={() => setScreenShare(!screenShare)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    screenShare
                      ? "bg-purple-500/20 text-purple-400"
                      : "glass hover:bg-white/10"
                  }`}
                  title={screenShare ? "Stop Sharing" : "Share Screen"}
                >
                  {screenShare ? <MonitorOff size={18} /> : <Monitor size={18} />}
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    showChat
                      ? "bg-purple-500/20 text-purple-400"
                      : "glass hover:bg-white/10"
                  }`}
                  title="Chat"
                >
                  <MessageSquare size={18} />
                </button>

                {/* FEATURE 2 & 3: role-split toolbar end/leave button */}
                {role === "teacher" ? (
                  <button
                    onClick={endMeeting}
                    className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    title="End Lecture"
                  >
                    <PhoneOff size={18} />
                  </button>
                ) : (
                  <button
                    onClick={leaveLecture}
                    className="p-3 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all duration-200"
                    title="Leave Lecture"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            </VideoGrid>
          </div>

          {/* Teacher: bottom student grid — now passes live AI props */}
          {role === "teacher" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {studentParticipants.length === 0 ? (
                <p className="text-gray-400 text-sm col-span-full">
                  Waiting for students…
                </p>
              ) : (
                studentParticipants.map((p) => (
                  <StudentCard
                    key={p.id}
                    name={p.name}
                    attention={p.averageAttention ?? 0}
                    state={p.attentionState ?? "Unknown"}
                    eyeStatus={p.eyeStatus ?? "—"}
                    headPosition={p.headPosition ?? "—"}
                    blinkCount={p.blinkCount ?? 0}
                    faceStatus={p.faceStatus ?? "—"}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 p-4 border-t lg:border-t-0 lg:border-l border-white/5 overflow-auto max-h-[50vh] lg:max-h-none">

          {/* AI Analytics panel — own user, completely unchanged */}
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                <h3 className="text-sm font-semibold">AI Analytics</h3>
              </div>
              {cameraOn && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Activity size={14} className="text-purple-400" />
                  Average Attention
                </span>
                <span className={`text-sm font-bold ${attentionColor}`}>
                  {averageAttention}%
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Brain size={14} className={stateColor} />
                  State
                </span>
                <span className={`text-sm font-bold ${stateColor}`}>
                  {attentionState}
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Eye size={14} className="text-yellow-400" />
                  Eyes
                </span>
                <span className="text-sm font-bold text-yellow-400">
                  {eyeStatus}
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Activity size={14} className="text-cyan-400" />
                  Head
                </span>
                <span className="text-sm font-bold text-cyan-400">
                  {headPosition}
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} className="text-blue-400" />
                  Duration
                </span>
                <span className="text-sm font-bold text-blue-400">
                  {formatTime(sessionTime)}
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <AlertTriangle size={14} className="text-orange-400" />
                  Blinks
                </span>
                <span className="text-sm font-bold text-orange-400">
                  {blinkCount}
                </span>
              </div>
              <div className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  Face Status
                </span>
                <span className="text-sm font-bold">{faceStatus}</span>
              </div>
            </div>

            {!cameraOn && (
              <button
                onClick={toggleCamera}
                className="w-full mt-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
              >
                Start Camera
              </button>
            )}
          </div>

          {/* Participants panel — socket-driven */}
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold">
                  Participants ({participants.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Teacher row */}
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 border border-purple-500/20">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">T</span>
                </div>
                <span className="text-sm font-medium">
                  {teacherParticipant
                    ? teacherParticipant.name
                    : role === "teacher"
                    ? "You (Teacher)"
                    : "Teacher"}
                </span>
                <span className="ml-auto text-xs text-purple-400">Host</span>
              </div>

              {/* Student rows — with live AI data */}
              {studentParticipants.length === 0 ? (
                <p className="text-gray-400 text-sm px-1">
                  Waiting for students…
                </p>
              ) : (
                studentParticipants.map((p) => (
                  <StudentCard
                    key={p.id}
                    name={p.name}
                    attention={p.averageAttention ?? 0}
                    state={p.attentionState ?? "Unknown"}
                    eyeStatus={p.eyeStatus ?? "—"}
                    headPosition={p.headPosition ?? "—"}
                    blinkCount={p.blinkCount ?? 0}
                    faceStatus={p.faceStatus ?? "—"}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LectureRoom;

