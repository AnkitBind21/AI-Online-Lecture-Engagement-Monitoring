import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, LogIn, User, Hash, ArrowRight, Loader2 } from "lucide-react";
import { joinRoom } from "../../services/roomService";

function JoinRoom() {
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!studentName.trim() || !roomCode.trim()) return;
    setLoading(true);
    await joinRoom(roomCode.toUpperCase(), studentName);
    setLoading(false);
    navigate("/lecture-room", {
      state: { role: "student", studentName, roomCode: roomCode.toUpperCase() },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] -top-60 -right-60" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] -bottom-40 -left-40" />

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">EduSense AI</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Join Lecture Room</h1>
          <p className="text-gray-400 text-sm">Enter the room code provided by your teacher</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 text-white text-sm border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all duration-200 placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Code</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 text-white text-sm border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all duration-200 placeholder:text-gray-600 tracking-widest font-mono uppercase"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || !studentName.trim() || !roomCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Join Room
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 glass rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 text-center">
              Ask your teacher for the room code to join the lecture.
              Make sure your camera is enabled for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
