function EmptyState({
  title = "No Data Found",
  description = "Nothing to display yet.",
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        {title}
      </h2>

      <p className="text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default EmptyState;