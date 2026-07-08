export function ParticipantCard({ name, status, attention }) {
  let statusColor = "bg-emerald-500";
  if (attention < 80 && attention >= 60) statusColor = "bg-amber-500";
  if (attention < 60) statusColor = "bg-red-500";

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
          <span className="text-xs font-medium text-slate-400">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-slate-400 capitalize">{status}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-white">{attention}%</span>
        <div className={`w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden`}>
          <div className={`h-full ${statusColor} rounded-full`} style={{ width: `${attention}%` }} />
        </div>
      </div>
    </div>
  );
}
