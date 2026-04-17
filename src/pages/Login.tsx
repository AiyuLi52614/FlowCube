import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Github, Hexagon } from "lucide-react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-deep overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block p-4 rounded-3xl elegant-glass mb-6"
          >
            <div className="w-12 h-12 bg-accent-blue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Hexagon className="w-8 h-8 text-white fill-white/20" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
            {isLogin ? "PORTAL LOGIN" : "CREATE ACCOUNT"}
          </h1>
          <p className="text-text-secondary text-xs uppercase tracking-widest opacity-60">
            "Regenerating planetary ecosystem"
          </p>
        </div>

        <div className="elegant-glass p-8 rounded-[2rem] space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50 group-focus-within:text-accent-blue transition-colors" />
              <input 
                type="email" 
                placeholder="OPERATOR EMAIL"
                className="w-full bg-black/20 border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent-blue/50 focus:bg-white/5 transition-all font-mono text-xs tracking-wider"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50 group-focus-within:text-accent-blue transition-colors" />
              <input 
                type="password" 
                placeholder="ACCESS KEY"
                className="w-full bg-black/20 border border-white/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent-blue/50 focus:bg-white/5 transition-all font-mono text-xs tracking-wider"
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-accent-blue hover:bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            {isLogin ? "INITIALIZE AUTH" : "REGISTER OPERATOR"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] text-text-secondary/40 uppercase font-mono tracking-widest whitespace-nowrap">External Link</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl flex items-center justify-center transition-all">
              <Github className="w-5 h-5 text-white/60" />
            </button>
            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl flex items-center justify-center transition-all font-bold text-lg text-white/60">
              G
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-text-secondary/40 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
          >
            {isLogin ? "New Operator? Create Profile" : "Existing Operator? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
