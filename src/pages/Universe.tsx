import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Compass, Sparkles, Users } from "lucide-react";
import PlanetCanvas from "../components/PlanetCanvas";

const MOCK_USERS = [
    { id: 1, name: "Yuhan", focusTime: 1200, mode: "learning" },
    { id: 2, name: "Stellar", focusTime: 800, mode: "learning" },
    { id: 3, name: "Neo", focusTime: 500, mode: "sports" },
    { id: 4, name: "Aria", focusTime: 1500, mode: "learning" },
    { id: 5, name: "Kael", focusTime: 200, mode: "sports" },
    { id: 6, name: "Luna", focusTime: 900, mode: "learning" },
];

export default function Universe() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-bg-deep flex flex-col font-sans overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 w-full p-10 flex justify-between items-center z-50">
        <button 
          onClick={() => navigate("/")}
          className="elegant-glass p-3 rounded-2xl hover:text-accent-blue transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-end gap-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">The Universe</h1>
            <div className="status-pill px-4 py-1 border border-white/5 bg-white/5 backdrop-blur-md rounded-full text-[9px] tracking-[0.3em] text-text-secondary uppercase">
                {MOCK_USERS.length} OPERATORS DETECTED
            </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-10 pt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10 overflow-y-auto pb-32 no-scrollbar">
        {MOCK_USERS.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            className="elegant-glass rounded-[2.5rem] p-6 h-[320px] relative group overflow-hidden"
          >
            {/* Small Planet View */}
            <div className="absolute inset-0 z-0">
               <PlanetCanvas focusSeconds={user.focusTime} status="idle" mode={user.mode} />
            </div>

            {/* Info Overlay */}
            <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] uppercase font-bold tracking-widest text-accent-blue">
                   {user.mode}
                </div>
                <Users className="w-4 h-4 text-white/20" />
              </div>

              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                <div className="text-white font-bold text-lg mb-0.5">{user.name}'s Planet</div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                   <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">Focus Score: {user.focusTime}pt</span>
                </div>
              </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-accent-blue/0 group-hover:bg-accent-blue/5 transition-colors pointer-events-none" />
          </motion.div>
        ))}
      </main>

      {/* Decorative Grids */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-bg-deep to-transparent pointer-events-none" />
    </div>
  );
}

