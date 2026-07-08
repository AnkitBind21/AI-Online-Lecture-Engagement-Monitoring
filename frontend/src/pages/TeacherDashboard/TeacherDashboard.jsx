import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createRoom } from "../../services/roomService";
import socket from "../../socket/socket";

import Sidebar from "../../components/Sidebar/Sidebar";
import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard";
import EmptyState from "../../components/EmptyState";

import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Settings,
  Bell,
  Copy,
  Play,
  Video,
  User,
  Activity,
  BrainCircuit,
  Check,
  RefreshCw,
  Download,
  FileText,
  Eye,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Camera,
  Mic,
  FileOutput,
  BellRing,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  GraduationCap,
  Hash,
  XCircle,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Reusable glass input ────────────────────────────────────────────────────
function GlassInput({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        )}
        <input
          className={`w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all ${Icon ? "pl-10" : ""}`}
          {...props}
        />
      </div>
    </div>
  );
}

function GlassSelect({ label, icon: Icon, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        )}
        <select
          className={`w-full appearance-none bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all ${Icon ? "pl-10" : ""}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/5">
          {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── CREATE ROOM ─────────────────────────────────────────────────────────────
function CreateRoomPage({ onStartLecture }) {
  const [form, setForm] = useState({
    courseName: "",
    subject: "",
    faculty: "Dr. Sarah Miller",
    semester: "1",
  });
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const generateCode = async () => {
    if (!form.courseName.trim()) {
      alert("Please enter Course Name first");
      return;
    }

    try {
      const res = await createRoom(form.courseName);
      console.log(res);

      setRoomCode(res.data.roomCode);
      setCopied(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setForm({ courseName: "", subject: "", faculty: "Dr. Sarah Miller", semester: "1" });
    setRoomCode("");
    setCopied(false);
  };

  const canStart = roomCode && form.courseName && form.subject;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Create Room</h2>
        <p className="text-sm text-slate-400 mt-1">
          Set up a new lecture room and generate a session code for your students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Lecture Details" subtitle="Fill in the information for this session">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Course Name"
                icon={BookOpen}
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
              />
              <GlassInput
                label="Subject Code"
                icon={Hash}
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. CS301"
              />
              <GlassInput
                label="Faculty Name"
                icon={User}
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                placeholder="e.g. Dr. Sarah Miller"
              />
              <GlassSelect
                label="Semester"
                icon={GraduationCap}
                name="semester"
                value={form.semester}
                onChange={handleChange}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => (
                  <option key={s} value={s} className="bg-slate-900">
                    Semester {s}
                  </option>
                ))}
              </GlassSelect>
            </div>
          </SectionCard>

          <SectionCard title="Room Code" subtitle="Generate a unique code students will use to join">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950 border border-white/10">
                  <Hash className="w-4 h-4 text-slate-500 shrink-0" />
                  <span
                    className={`flex-1 font-mono text-xl font-bold tracking-[0.2em] ${
                      roomCode ? "text-violet-400" : "text-slate-600"
                    }`}
                  >
                    {roomCode || "——————"}
                  </span>
                  <button
                    onClick={copyCode}
                    disabled={!roomCode}
                    title="Copy code"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={generateCode}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Code copied to clipboard
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 backdrop-blur-sm space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Ready to start?</h3>
              <p className="text-sm text-slate-300 mt-1">
                Complete the form and generate a room code before launching.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {[
                { label: "Course name", done: !!form.courseName },
                { label: "Subject code", done: !!form.subject },
                { label: "Room code generated", done: !!roomCode },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      done ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  />
                  <span className={done ? "text-white" : "text-slate-500"}>{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onStartLecture(roomCode)}
              disabled={!canStart}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Lecture
            </button>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 leading-relaxed">
              Share the room code with students before the lecture begins. Each code is unique
              and valid for one session only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
const mockReports = [
  { id: 1, date: "Jun 27, 2026", roomCode: "A3F9KL", duration: "00:45:22", attention: 85, students: 24, status: "Completed" },
  { id: 2, date: "Jun 26, 2026", roomCode: "B7X2NP", duration: "01:02:15", attention: 79, students: 31, status: "Completed" },
  { id: 3, date: "Jun 25, 2026", roomCode: "C1M8QR", duration: "00:55:10", attention: 92, students: 28, status: "Completed" },
  { id: 4, date: "Jun 23, 2026", roomCode: "D5K4TW", duration: "00:38:47", attention: 61, students: 19, status: "Completed" },
  { id: 5, date: "Jun 20, 2026", roomCode: "E9Y6UV", duration: "01:15:33", attention: 88, students: 35, status: "Completed" },
];

function AttentionBadge({ value }) {
  const color =
    value >= 80
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : value >= 65
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {value}%
    </span>
  );
}

function ReportsPage() {
  const totalSessions = mockReports.length;
  const avgAttention = Math.round(
    mockReports.reduce((a, r) => a + r.attention, 0) / totalSessions
  );
  const highest = Math.max(...mockReports.map((r) => r.attention));
  const lowest = Math.min(...mockReports.map((r) => r.attention));

  const parseDuration = (d) => {
    const [h, m, s] = d.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  const totalSecs = mockReports.reduce((a, r) => a + parseDuration(r.duration), 0);
  const totalDuration = `${String(Math.floor(totalSecs / 3600)).padStart(2, "0")}:${String(
    Math.floor((totalSecs % 3600) / 60)
  ).padStart(2, "0")}:${String(totalSecs % 60).padStart(2, "0")}`;

  const statCards = [
    { icon: Video, label: "Total Sessions", value: totalSessions, color: "violet" },
    { icon: Activity, label: "Avg Attention", value: `${avgAttention}%`, color: "blue" },
    { icon: Clock, label: "Total Duration", value: totalDuration, color: "emerald" },
    { icon: TrendingUp, label: "Highest", value: `${highest}%`, color: "amber" },
    { icon: TrendingDown, label: "Lowest", value: `${lowest}%`, color: "red" },
  ];

  const colorMap = {
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
    blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400"   },
    emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400" },
    amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400"  },
    red:    { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400"    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review session history, attention data, and export records.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className={`rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm p-4 space-y-3`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${c.text}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`text-xl font-bold ${c.text} mt-0.5`}>{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {mockReports.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No reports yet</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Once you complete a lecture session, reports will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Session History</h3>
              <p className="text-xs text-slate-400 mt-0.5">{mockReports.length} sessions recorded</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-medium transition-all">
              <Download className="w-3.5 h-3.5" />
              Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Room Code</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Avg Attention</th>
                  <th className="px-6 py-3 font-medium">Students</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockReports.map((session) => (
                  <tr
                    key={session.id}
                    className="text-sm hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 text-white font-medium">{session.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg text-xs">
                        {session.roomCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                      {session.duration}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                            style={{ width: `${session.attention}%` }}
                          />
                        </div>
                        <AttentionBadge value={session.attention} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{session.students}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                          title="Export PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Download CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        enabled ? "bg-violet-600" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingsRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Miller",
    department: "Computer Science",
    email: "sarah.miller@university.edu",
  });
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [camera, setCamera] = useState("default");
  const [microphone, setMicrophone] = useState("default");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setProfile({
      name: "Dr. Sarah Miller",
      department: "Computer Science",
      email: "sarah.miller@university.edu",
    });
    setDarkMode(true);
    setNotifications(true);
    setCamera("default");
    setMicrophone("default");
    setExportFormat("pdf");
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage your profile and application preferences.
        </p>
      </div>

      {/* Profile */}
      <SectionCard title="Profile" subtitle="Your public-facing instructor information">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-bold border border-violet-500/50 shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold text-white">{profile.name}</p>
            <p className="text-sm text-slate-400">{profile.department}</p>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            label="Full Name"
            icon={User}
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Dr. Sarah Miller"
          />
          <GlassInput
            label="Department"
            icon={GraduationCap}
            value={profile.department}
            onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
            placeholder="Computer Science"
          />
          <div className="sm:col-span-2">
            <GlassInput
              label="Email Address"
              icon={FileOutput}
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@university.edu"
            />
          </div>
        </div>
      </SectionCard>

      {/* App Settings */}
      <SectionCard
        title="Application Settings"
        subtitle="Customize your experience and hardware preferences"
      >
        <SettingsRow
          icon={darkMode ? Moon : Sun}
          label="Dark Mode"
          description="Toggle between dark and light interface theme"
        >
          <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </SettingsRow>

        <SettingsRow
          icon={BellRing}
          label="Notifications"
          description="Receive alerts for attention drops and session events"
        >
          <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
        </SettingsRow>

        <SettingsRow
          icon={Camera}
          label="Camera"
          description="Select your preferred video input device"
        >
          <select
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all appearance-none"
          >
            <option value="default" className="bg-slate-900">Default Camera</option>
            <option value="external" className="bg-slate-900">External Webcam</option>
            <option value="builtin" className="bg-slate-900">Built-in Camera</option>
          </select>
        </SettingsRow>

        <SettingsRow
          icon={Mic}
          label="Microphone"
          description="Select your preferred audio input device"
        >
          <select
            value={microphone}
            onChange={(e) => setMicrophone(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all appearance-none"
          >
            <option value="default" className="bg-slate-900">Default Mic</option>
            <option value="external" className="bg-slate-900">External Mic</option>
            <option value="headset" className="bg-slate-900">Headset Mic</option>
          </select>
        </SettingsRow>

        <SettingsRow
          icon={FileOutput}
          label="Export Format"
          description="Default format when downloading session reports"
        >
          <div className="flex items-center gap-2">
            {["pdf", "csv", "xlsx"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all uppercase tracking-wide ${
                  exportFormat === fmt
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </SettingsRow>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)]"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Settings
        </button>
      </div>
    </div>
  );
}

// ─── TEACHER DASHBOARD ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roomCode, setRoomCode] = useState(null);
  const [startingLecture, setStartingLecture] = useState(false);
  const navigate = useNavigate();

  const teacher = JSON.parse(localStorage.getItem("teacher"));

  const teacherName = teacher?.name || "Teacher";
  const teacherEmail = teacher?.email || "";

  const initials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Quick-start "Generate Room" button on the Dashboard tab (no REST call,
  // just a local code preview — the full Create Room page does the REST call)
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  /**
   * handleStartLecture
   *
   * Called from both the Quick Start widget (Dashboard tab) and the full
   * Create Room page.
   *
   * Steps:
   *  1. Call POST /api/rooms/:roomCode/start  (activates the room in MongoDB)
   *  2. Connect the socket and emit "join-room" so the teacher is already in
   *     the Socket.IO room when LectureRoom mounts — students who join first
   *     will already find the teacher in the participant list.
   *  3. Navigate to LectureRoom with role + roomCode in location.state.
   *
   * The socket stays connected through the navigation because socket.js
   * exports a singleton with autoConnect:false — it is NOT recreated on
   * navigation.  LectureRoom's useEffect will emit a second "join-room"
   * for the teacher which the server deduplicates by socketId.
   */
  const handleStartLecture = async (code) => {
    const finalCode = code || roomCode;
    if (!finalCode) return;

    setStartingLecture(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Activate the session in MongoDB
      await axios.post(
        `http://localhost:5000/api/rooms/${finalCode}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Connect socket + join the room early so the teacher is present
      //    before any student arrives
      if (!socket.connected) socket.connect();

      socket.emit("join-room", {
        roomCode: finalCode,
        name: teacherName,
        role: "teacher",
        token,
      });

      // 3. Navigate — LectureRoom will re-emit join-room (deduplicated by server)
      navigate("/lecture-room", {
        state: { role: "teacher", roomCode: finalCode },
      });
    } catch (err) {
      console.error("Failed to start lecture:", err);
      alert(
        err?.response?.data?.message ||
          "Could not start the lecture. Please try again."
      );
    } finally {
      setStartingLecture(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Create Room", icon: PlusCircle },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const weeklyData = [
    { name: "Mon", attention: 78 },
    { name: "Tue", attention: 82 },
    { name: "Wed", attention: 75 },
    { name: "Thu", attention: 88 },
    { name: "Fri", attention: 92 },
    { name: "Sat", attention: 85 },
    { name: "Sun", attention: 79 },
  ];

  const sessionsData = [
    { name: "Mon", count: 2 },
    { name: "Tue", count: 3 },
    { name: "Wed", count: 1 },
    { name: "Thu", count: 4 },
    { name: "Fri", count: 2 },
    { name: "Sat", count: 0 },
    { name: "Sun", count: 0 },
  ];

  const recentSessions = [
    { id: 1, date: "Jun 27, 2026", duration: "00:45:22", attention: 85, students: 24 },
    { id: 2, date: "Jun 26, 2026", duration: "01:02:15", attention: 79, students: 31 },
    { id: 3, date: "Jun 25, 2026", duration: "00:55:10", attention: 92, students: 28 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        items={navItems}
        activeItem={activeTab}
        onSelect={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-bold text-white capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{teacherName}</p>
                <p className="text-xs text-slate-400">{teacherEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold border border-violet-500/50">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto space-y-8 relative z-10"
            >
              {/* ── DASHBOARD ── */}
              {activeTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Video} label="Total Sessions" value="124" trend="+12%" color="violet" />
                    <StatCard icon={User} label="Active Students" value="842" trend="+5%" color="blue" />
                    <StatCard icon={Activity} label="Avg Attention" value="84%" trend="+2%" color="emerald" />
                    <StatCard icon={BrainCircuit} label="Best Score" value="96%" color="amber" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ChartCard title="Weekly Attention Trends" subtitle="Average class engagement over the last 7 days">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                              itemStyle={{ color: "#fff" }}
                            />
                            <Line type="monotone" dataKey="attention" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#0f172a" }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
                        <p className="text-sm text-slate-300 mb-6">
                          Create a new room to start monitoring instantly.
                        </p>

                        {!roomCode ? (
                          <button
                            onClick={handleCreateRoom}
                            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                          >
                            <PlusCircle className="w-5 h-5" />
                            Generate Room
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                              <span className="text-2xl font-mono font-bold tracking-widest text-violet-400">
                                {roomCode}
                              </span>
                              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleStartLecture(roomCode)}
                              disabled={startingLecture}
                              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                            >
                              <Play className="w-5 h-5" />
                              {startingLecture ? "Starting…" : "Start Lecture"}
                            </button>
                          </div>
                        )}
                      </div>

                      <ChartCard title="Daily Sessions" subtitle="Lectures per day">
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={sessionsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <Tooltip
                              cursor={{ fill: "rgba(255,255,255,0.05)" }}
                              contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "8px" }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
                      <button
                        onClick={() => setActiveTab("reports")}
                        className="text-sm font-medium text-violet-400 hover:text-violet-300"
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-sm text-slate-400">
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Duration</th>
                            <th className="p-4 font-medium">Avg Attention</th>
                            <th className="p-4 font-medium">Students</th>
                            <th className="p-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {recentSessions.map((session) => (
                            <tr
                              key={session.id}
                              className="text-sm hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="p-4 text-white font-medium">{session.date}</td>
                              <td className="p-4 text-slate-300">{session.duration}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full max-w-[60px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${session.attention}%` }}
                                    />
                                  </div>
                                  <span className="text-emerald-400 font-bold">
                                    {session.attention}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-slate-300">{session.students}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ── CREATE ROOM ── */}
              {activeTab === "create" && (
                <CreateRoomPage onStartLecture={handleStartLecture} />
              )}

              {/* ── REPORTS ── */}
              {activeTab === "reports" && <ReportsPage />}

              {/* ── SETTINGS ── */}
              {activeTab === "settings" && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}