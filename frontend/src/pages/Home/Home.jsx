import { motion } from "framer-motion";
import Navbar from "../../components/Navbar/Navbar";
import { ArrowRight, Activity, Eye, BrainCircuit, BarChart, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    { icon: Eye, title: "Eye Tracking", desc: "Real-time gaze estimation to measure visual engagement." },
    { icon: Activity, title: "Attention Scoring", desc: "Proprietary AI models calculate an aggregate attention score." },
    { icon: BrainCircuit, title: "Emotion Analysis", desc: "Detect cognitive states: attentive, distracted, or drowsy." },
    { icon: Shield, title: "Privacy First", desc: "On-device processing ensures raw video never leaves the browser." },
    { icon: BarChart, title: "Live Reports", desc: "Instant analytics and historical trends for every lecture." },
    { icon: Zap, title: "10ms Response", desc: "Ultra-low latency for seamless, continuous monitoring." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mt-20 mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></span>
            <span className="text-sm font-medium text-slate-300">EduSense AI v2.0 is now live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-8">
            AI-Powered <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
              Lecture Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Monitor student attention, emotion, and engagement in real-time during online lectures. 
            The premium analytics platform for modern educational institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/teacher-login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2"
            >
              Teacher Login
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/student-login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all backdrop-blur-sm"
            >
              Student Login
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/10 mb-32"
        >
          {[
            { label: "Detection Accuracy", value: "98%" },
            { label: "Students Supported", value: "50+" },
            { label: "Analytics", value: "Real-Time" },
            { label: "Response Time", value: "10ms" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <h4 className="text-4xl font-bold text-white mb-2">{stat.value}</h4>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Enterprise-Grade Capabilities</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to understand how your students engage with your content, powered by state-of-art machine learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 relative z-10">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BrainCircuit className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-white">EduSense AI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 EduSense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
