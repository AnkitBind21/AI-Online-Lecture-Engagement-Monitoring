function ChartCard({ title, subtitle, children }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;