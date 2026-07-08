import { Activity, Eye, Monitor, Brain, Clock, TrendingUp } from "lucide-react";

const metrics = [
  { key: "attentionState", label: "Attention State", icon: Brain, color: "text-purple-400" },
  { key: "averageAttention", label: "Avg Attention", icon: TrendingUp, color: "text-green-400" },
  { key: "sessionTime", label: "Duration", icon: Clock, color: "text-blue-400" },
  { key: "faceStatus", label: "Face Status", icon: Monitor, color: "text-cyan-400" },
  { key: "eyeStatus", label: "Eye Status", icon: Eye, color: "text-yellow-400" },
  { key: "headPosition", label: "Head Position", icon: Activity, color: "text-orange-400" },
];

function AnalyticsPanel({ metrics: metricValues = {} }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity size={18} className="text-purple-400" />
        Session Analytics
      </h3>
      <div className="space-y-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = metricValues[metric.key] || "—";
          return (
            <div key={metric.key} className="glass rounded-xl p-3.5 glass-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={metric.color} />
                  <span className="text-xs text-gray-400 font-medium">{metric.label}</span>
                </div>
                <span className={`text-sm font-bold ${metric.color}`}>
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnalyticsPanel;
