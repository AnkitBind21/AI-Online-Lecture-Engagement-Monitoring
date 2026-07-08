import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

function Sidebar({ items, activeItem, onSelect, onLogout }) {
  return (
    <div className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl h-screen flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-violet-500" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">EduSense AI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-violet-500/10 border border-violet-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-violet-400" : ""}`} />
              <span className="font-medium text-sm relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all mt-2"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;