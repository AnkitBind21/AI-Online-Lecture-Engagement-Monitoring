import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Brain,
  Clock,
  TrendingUp,
  AlertTriangle,
  Search,
  CheckCircle2,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import ChartCard from "../../components/ChartCard";
import EmptyState from "../../components/EmptyState";
import { formatTime } from "../../utils/attentionCalculator";
import { getReports } from "../../services/reportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

function Reports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // ── Loading / error state (only used when fetching from the API) ──────────
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── Report values — seeded from location.state or fetched from API ────────
  const [reportData,        setReportData]        = useState([]);
  const [averageAttention,  setAverageAttention]  = useState(0);
  const [sessionTime,       setSessionTime]       = useState(0);
  const [fromState,         setFromState]         = useState(false);
  // BUGFIX: per-student breakdown, seeded the same way as the fields above
  const [studentReports,    setStudentReports]    = useState([]);

  useEffect(() => {
    const state = location.state;

    // If the page was reached by navigating directly after ending a lecture
    // (the normal flow) use what was passed in location.state.
    if (state?.reportData?.length > 0) {
      setReportData(state.reportData);
      setAverageAttention(state.averageAttention ?? 0);
      setSessionTime(state.sessionTime ?? 0);
      setStudentReports(state.studentReports ?? []);
      setFromState(true);
      return;
    }

    // Otherwise (page refresh, direct URL visit, or empty state) fetch the
    // latest report from the API.  The backend returns reports sorted by
    // newest first, so index 0 is always the most recent one.
    const fetchLatest = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getReports();

        // getReports returns the raw axios response object: { success, data: [...] }
        // It falls back to [] on error, so guard both cases.
        const reports = result?.data ?? result ?? [];

        if (Array.isArray(reports) && reports.length > 0) {
          const latest = reports[0];
          setReportData(latest.reportData ?? []);
          setAverageAttention(latest.averageAttention ?? 0);
          setSessionTime(latest.sessionTime ?? 0);
          setStudentReports(latest.studentReports ?? []);
        }
      } catch (err) {
        console.error("Failed to load report:", err);
        setFetchError("Could not load the report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []); // run once on mount

  const hasData = reportData.length > 0;

  const attentiveCount  = reportData.filter((item) => item.state === "Attentive").length;
  const distractedCount = reportData.filter((item) => item.state === "Distracted").length;
  const drowsyCount     = reportData.filter((item) => item.state === "Drowsy").length;

  const attentivePercentage = reportData.length > 0
    ? Math.round((attentiveCount / reportData.length) * 100)
    : 0;

  const pieData = [
    { name: "Attentive",  value: attentiveCount  },
    { name: "Distracted", value: distractedCount },
    { name: "Drowsy",     value: drowsyCount     },
  ];

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Session Attention Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Average Attention: ${averageAttention}%`, 14, 40);
    doc.text(`Session Duration: ${formatTime(sessionTime)}`, 14, 48);
    doc.text(`Attentive: ${attentivePercentage}%`, 14, 56);
    doc.text(`Distracted Events: ${distractedCount}`, 14, 64);
    doc.text(`Drowsy Events: ${drowsyCount}`, 14, 72);
    if (reportData.length > 0) {
      autoTable(doc, {
        startY: 85,
        head: [["Time", "Attention", "State"]],
        body: reportData.map((item) => [item.time, `${item.averageAttention}%`, item.state]),
      });
    }
    doc.save("attention-report.pdf");
  };

  const goToDashboard  = () => navigate("/teacher-dashboard");
  const goToNewLecture = () => navigate("/teacher-dashboard", { state: { openCreateRoom: true } });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading report…</p>
        </div>
      </div>
    );
  }

  // ── Fetch error banner (non-fatal — still shows empty state below) ────────
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Success Banner — only shown when coming straight from a session */}
        {fromState && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              <span className="font-semibold text-emerald-400">
                Lecture Session Completed Successfully
              </span>
            </div>
            <p className="text-sm text-gray-400 pl-6">
              Your lecture has ended successfully. You can review the analytics below or return to your dashboard.
            </p>
          </div>
        )}

        {/* Fetch error banner */}
        {fetchError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">
            <p className="text-sm text-red-400">{fetchError}</p>
          </div>
        )}

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Session Report</h1>
            <p className="text-gray-400 text-sm mt-1">
              Detailed analytics and insights from your lecture
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={goToDashboard}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200"
            >
              <LayoutDashboard size={15} />
              Back to Teacher Dashboard
            </button>
            <button
              onClick={goToNewLecture}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/20"
            >
              <Plus size={15} />
              Start New Lecture
            </button>
            {hasData && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/20"
              >
                <Download size={15} />
                Export PDF
              </button>
            )}
          </div>
        </div>

        {!hasData ? (
          <EmptyState
            icon={FileText}
            title="No Session Report Available"
            description="Complete a lecture session to generate attendance and engagement analytics."
            action={
              <button
                onClick={goToDashboard}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/20 mx-auto"
              >
                <LayoutDashboard size={15} />
                Back to Teacher Dashboard
              </button>
            }
          />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <Brain size={18} className="text-purple-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Avg Attention
                </p>
                <p
                  className={`text-2xl font-bold ${
                    averageAttention >= 80
                      ? "text-green-400"
                      : averageAttention >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {averageAttention}%
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <Clock size={18} className="text-blue-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatTime(sessionTime)}
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Attentive
                </p>
                <p className="text-2xl font-bold text-green-400">{attentivePercentage}%</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle size={18} className="text-yellow-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Distracted
                </p>
                <p className="text-2xl font-bold text-yellow-400">{distractedCount}</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Drowsy
                </p>
                <p className="text-2xl font-bold text-red-400">{drowsyCount}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Attention Over Time" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={reportData}>
                    <defs>
                      <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="time"
                      stroke="#334155"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#334155"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,35,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        backdropFilter: "blur(16px)",
                      }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="averageAttention"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#reportGrad)"
                      dot={{ fill: "#8b5cf6", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageAttention"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Attention Distribution" icon={PieChartIcon}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,35,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        backdropFilter: "blur(16px)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Session Timeline table */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  <h2 className="text-lg font-semibold">Session Timeline</h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {reportData.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-40 pl-8 pr-3 py-2 rounded-lg bg-slate-900/50 text-sm text-white border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all duration-200 placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Time
                      </th>
                      <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Attention
                      </th>
                      <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        State
                      </th>
                      <th className="text-left p-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Indicator
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData
                      .filter((item) =>
                        searchTerm
                          ? item.state
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            item.time?.includes(searchTerm)
                          : true
                      )
                      .map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="p-3 text-sm text-gray-400 font-mono">
                            {item.time}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-sm font-semibold ${
                                item.averageAttention >= 80
                                  ? "text-green-400"
                                  : item.averageAttention >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {item.averageAttention}%
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.state === "Attentive"
                                  ? "bg-green-500/10 text-green-400"
                                  : item.state === "Distracted"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.state === "Attentive"
                                    ? "bg-green-400"
                                    : item.state === "Distracted"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                              />
                              {item.state}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.averageAttention >= 80
                                    ? "bg-green-400"
                                    : item.averageAttention >= 60
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                                style={{ width: `${item.averageAttention}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BUGFIX: Individual Student Reports — additive section, does
                not touch any markup above. Only rendered when the backend/
                nav-state actually provided a per-student breakdown. */}
            {studentReports.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-purple-400" />
                  <h2 className="text-lg font-semibold">Individual Student Reports</h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {studentReports.length} student{studentReports.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {studentReports.map((student, idx) => (
                    <div
                      key={`${student.name}-${idx}`}
                      className="glass-card rounded-2xl p-6 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white">
                          {student.name}
                        </h3>
                        <span
                          className={`text-lg font-bold ${
                            student.averageAttention >= 80
                              ? "text-green-400"
                              : student.averageAttention >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {student.averageAttention}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Focused
                          </p>
                          <p className="text-sm font-semibold text-green-400">
                            {student.focusedPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Distracted
                          </p>
                          <p className="text-sm font-semibold text-yellow-400">
                            {student.distractedPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Drowsy
                          </p>
                          <p className="text-sm font-semibold text-red-400">
                            {student.drowsyPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Blinks
                          </p>
                          <p className="text-sm font-semibold text-blue-400">
                            {student.blinkCount}
                          </p>
                        </div>
                      </div>

                      {student.timeline?.length > 0 && (
                        <ResponsiveContainer width="100%" height={140}>
                          <LineChart data={student.timeline}>
                            <XAxis
                              dataKey="time"
                              stroke="#334155"
                              tick={{ fill: "#64748b", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              domain={[0, 100]}
                              stroke="#334155"
                              tick={{ fill: "#64748b", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              width={28}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "rgba(15,15,35,0.9)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                backdropFilter: "blur(16px)",
                              }}
                              labelStyle={{ color: "#94a3b8" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="averageAttention"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;

