/**
 * StudentCard.jsx
 *
 * Changes from previous version:
 *   - Accepts eyeStatus, headPosition, blinkCount, faceStatus props
 *   - Renders them as a compact details row below the existing
 *     name / state / attention% header row
 *   - All styling matches the existing dark glassmorphism palette exactly
 *   - No layout, color, or component changes beyond the new data rows
 */

import { User, Circle, Eye, Activity, AlertTriangle, Scan } from "lucide-react";

const statusColors = {
  Attentive:  "text-green-400",
  Distracted: "text-yellow-400",
  Drowsy:     "text-red-400",
  Absent:     "text-gray-500",
  Unknown:    "text-gray-500",
};

const statusBg = {
  Attentive:  "bg-green-500/10 border-green-500/20",
  Distracted: "bg-yellow-500/10 border-yellow-500/20",
  Drowsy:     "bg-red-500/10 border-red-500/20",
  Absent:     "bg-gray-500/10 border-gray-500/20",
  Unknown:    "bg-gray-500/10 border-gray-500/20",
};

function StudentCard({
  name           = "Student",
  attention      = 0,
  state          = "Unknown",
  eyeStatus      = "—",
  headPosition   = "—",
  blinkCount     = 0,
  faceStatus     = "—",
}) {
  const resolvedBg     = statusBg[state]     || statusBg.Unknown;
  const resolvedColor  = statusColors[state] || statusColors.Unknown;

  return (
    <div
      className={`glass-card rounded-xl p-3 border ${resolvedBg} transition-all duration-300`}
    >
      {/* ── Top row: avatar / name / state / attention% ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Circle size={6} className={`fill-current ${resolvedColor}`} />
            <span className={`text-xs ${resolvedColor}`}>{state}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p
            className={`text-sm font-bold ${
              attention >= 80
                ? "text-green-400"
                : attention >= 50
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {attention}%
          </p>
        </div>
      </div>

      {/* ── Detail rows: live AI metrics ── */}
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {/* Eyes */}
        <div className="flex items-center gap-1.5">
          <Eye size={11} className="text-yellow-400 shrink-0" />
          <span className="text-[10px] text-gray-500 truncate">
            Eyes:{" "}
            <span className="text-yellow-400 font-medium">{eyeStatus}</span>
          </span>
        </div>

        {/* Head */}
        <div className="flex items-center gap-1.5">
          <Activity size={11} className="text-cyan-400 shrink-0" />
          <span className="text-[10px] text-gray-500 truncate">
            Head:{" "}
            <span className="text-cyan-400 font-medium">{headPosition}</span>
          </span>
        </div>

        {/* Blinks */}
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={11} className="text-orange-400 shrink-0" />
          <span className="text-[10px] text-gray-500 truncate">
            Blinks:{" "}
            <span className="text-orange-400 font-medium">{blinkCount}</span>
          </span>
        </div>

        {/* Face */}
        <div className="flex items-center gap-1.5">
          <Scan size={11} className="text-purple-400 shrink-0" />
          <span className="text-[10px] text-gray-500 truncate">
            Face:{" "}
            <span className="text-purple-400 font-medium">{faceStatus}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default StudentCard;
