export function AnalyticsCard({ label, value, statusColor = "violet" }) {
  const colors = {
    violet: "bg-violet-500 text-violet-500",
    emerald: "bg-emerald-500 text-emerald-500",
    amber: "bg-amber-500 text-amber-500",
    red: "bg-red-500 text-red-500",
    blue: "bg-blue-500 text-blue-500",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
      <span className="text-sm text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white">{value}</span>
        <div className={`w-2 h-2 rounded-full ${colors[statusColor].split(" ")[0]} shadow-[0_0_8px_currentColor] ${colors[statusColor].split(" ")[1]}`} />
      </div>
    </div>
  );
}
