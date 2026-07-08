import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-violet-500/20 p-2 rounded-xl group-hover:bg-violet-500/30 transition-colors">
            <BrainCircuit className="w-6 h-6 text-violet-400" />
          </div>

          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            EduSense AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/teacher-login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Teacher Login
          </Link>

          <Link
            to="/student-login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Student Login
          </Link>

          <Link
            to="/teacher-login"
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;