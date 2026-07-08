/**
 * StudentLogin.jsx
 *
 * Change: handleJoin now calls the REST API (joinRoomApi) to persist the
 * student in MongoDB BEFORE navigating to the LectureRoom.
 * The LectureRoom will then emit the socket "join-room" event.
 *
 * UI is completely unchanged.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Key, ArrowRight, BrainCircuit } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { joinRoomApi } from "../../services/roomService";

export default function StudentLogin() {
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim() || !roomCode.trim()) return;

    setLoading(true);
    try {
      // Persist the student in MongoDB first so the teacher's REST poll
      // also returns the student (fallback).  The Socket.IO event fires
      // immediately after navigation in LectureRoom.
      await joinRoomApi(roomCode.toUpperCase(), studentName.trim());

      navigate("/lecture-room", {
        state: {
          role: "student",
          studentName: studentName.trim(),
          roomCode: roomCode.toUpperCase(),
        },
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Could not join room. Please check the room code and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Session</h1>
            <p className="text-slate-400">Enter your details to join the lecture</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Room Code</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all uppercase"
                  placeholder="A1B2C3"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
            >
              {loading ? "Joining…" : "Join Room"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/teacher-login"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              Are you a teacher? Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
