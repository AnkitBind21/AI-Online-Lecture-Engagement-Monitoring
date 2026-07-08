import { motion } from "framer-motion";

function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 ${trend.startsWith("+") ? "text-emerald-400" : "text-slate-400"}`}>
              {trend} vs last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );
}
export default StatCard;
