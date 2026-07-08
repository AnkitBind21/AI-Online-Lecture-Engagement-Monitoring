import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Brain,
  FileText,
  Eye,
  ChevronRight,
  Calendar,
  Activity,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard";
import { getReports } from "../../services/reportService";
import { formatTime } from "../../utils/attentionCalculator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const weeklyData = [
  { day: "Mon", attention: 82, students: 45, engagement: 78 },
  { day: "Tue", attention: 78, students: 42, engagement: 72 },
  { day: "Wed", attention: 91, students: 48, engagement: 88 },
  { day: "Thu", attention: 85, students: 44, engagement: 80 },
  { day: "Fri", attention: 88, students: 46, engagement: 85 },
  { day: "Sat", attention: 76, students: 38, engagement: 70 },
  { day: "Sun", attention: 72, students: 35, engagement: 65 },
];

const monthlyData = [
  { month: "Oct", attention: 79, sessions: 18 },
  { month: "Nov", attention: 84, sessions: 22 },
  { month: "Dec", attention: 82, sessions: 20 },
  { month: "Jan", attention: 88, sessions: 24 },
  { month: "Feb", attention: 86, sessions: 21 },
];

function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [timeframe, setTimeframe] = useState("weekly");

  useEffect(() => {
    const fetchReports = async () => {
      const data = await getReports();
      setReports(data);
    };
    fetchReports();
  }, []);

  const totalSessions = reports.length || 24;
  const overallAverage = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.averageAttention, 0) / reports.length)
    : 82;
  const bestSession = reports.length > 0
    ? Math.max(...reports.map((r) => r.averageAttention))
    : 91;
  const totalStudents = reports.reduce((s, r) => s + (r.students || 0), 0) || 156;

  const chartData = timeframe === "weekly" ? weeklyData : monthlyData;
  const chartKey = timeframe === "weekly" ? "day" : "month";

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of all your lecture analytics</p>
          </div>
          <div className="flex items-center gap-2 glass rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeframe === "weekly" ? "bg-purple-500/10 text-purple-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeframe === "monthly" ? "bg-purple-500/10 text-purple-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Brain} label="Overall Attention" value={`${overallAverage}%`} color="text-purple-400" bgColor="bg-purple-500/10" subtitle="+3% vs last month" trend={1} />
          <StatCard icon={Calendar} label="Total Sessions" value={totalSessions} color="text-blue-400" bgColor="bg-blue-500/10" subtitle="+4 this month" trend={1} />
          <StatCard icon={Users} label="Total Students" value={totalStudents} color="text-emerald-400" bgColor="bg-emerald-500/10" subtitle="+12 new" trend={1} />
          <StatCard icon={TrendingUp} label="Best Session" value={`${bestSession}%`} color="text-cyan-400" bgColor="bg-cyan-500/10" subtitle="Highest recorded" trend={1} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Attention Trend" icon={Activity}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="attentionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey={chartKey} stroke="#334155" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,35,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(16px)" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="attention" stroke="#8b5cf6" strokeWidth={2} fill="url(#attentionGrad)" />
                <Area type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sessions Overview" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey={chartKey} stroke="#334155" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,35,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(16px)" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey={timeframe === "weekly" ? "students" : "sessions"} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold">Recent Sessions</h2>
            </div>
            <button
              onClick={() => navigate("/reports")}
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Duration</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Attention</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="p-3 text-sm">{
                        report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "N/A"
                      }</td>
                      <td className="p-3 text-sm text-gray-400">{formatTime(report.sessionTime || 0)}</td>
                      <td className="p-3">
                        <span className={`text-sm font-semibold ${(report.averageAttention || 0) >= 80 ? "text-green-400" : (report.averageAttention || 0) >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                          {report.averageAttention || 0}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <div className={`w-1.5 h-1.5 rounded-full ${(report.averageAttention || 0) >= 80 ? "bg-green-400" : (report.averageAttention || 0) >= 60 ? "bg-yellow-400" : "bg-red-400"}`} />
                          {(report.averageAttention || 0) >= 80 ? "Good" : (report.averageAttention || 0) >= 60 ? "Average" : "Needs Improvement"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate("/reports", { state: { reportData: report.reportData || [], averageAttention: report.averageAttention, sessionTime: report.sessionTime } })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                      No sessions yet. Start a lecture to see data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
