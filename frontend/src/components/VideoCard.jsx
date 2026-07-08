import { motion } from "framer-motion";
import { User } from "lucide-react";

export function VideoCard({ name, attention, status, isLocal = false, videoRef }) {
  const isAttentive = attention >= 80;
  const isDistracted = attention < 80 && attention >= 60;
  
  let statusColor = "bg-emerald-500";
  if (isDistracted) statusColor = "bg-amber-500";
  if (attention < 60) statusColor = "bg-red-500";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video group">
      {isLocal && videoRef ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
            <span className="text-2xl font-medium text-slate-400">
              {name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/10">
          <User className="w-4 h-4 text-slate-300" />
          <span className="text-sm font-medium text-white">{name} {isLocal && "(You)"}</span>
        </div>
        
        {!isLocal && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/10">
            <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_currentColor]`} />
            <span className="text-sm font-bold text-white">{attention}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
