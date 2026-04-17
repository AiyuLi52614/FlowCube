import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Gift, Trees, Sparkles, Trophy, Lock } from "lucide-react";
import { useState } from "react";

export default function PlanetSettings() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem("focus_streak") || "0");
  });
  const [showBlindBox, setShowBlindBox] = useState(false);

  // Mock items unlocked
  const stats = [
    { label: "小草", count: 12, icon: "🌱" },
    { label: "繁树", count: 3, icon: "🌳" },
    { label: "精灵", count: 1, icon: "✨" },
  ];

  return (
    <div className="relative min-h-screen bg-bg-deep flex flex-col p-10 font-sans overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px]" />
      </div>

      <header className="flex justify-between items-center z-10 mb-12">
        <button 
          onClick={() => navigate("/")}
          className="elegant-glass p-3 rounded-2xl hover:text-accent-blue transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">我的星球生态</h1>
          <p className="text-text-secondary text-xs uppercase tracking-widest opacity-60 font-mono">Planet Ecosystem Dashboard</p>
        </div>
      </header>

      <main className="z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Grassland Visualization Card */}
        <div className="lg:col-span-8 elegant-glass rounded-[3rem] p-10 relative overflow-hidden h-[450px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          
          <h2 className="absolute top-10 left-10 text-xl font-bold flex items-center gap-2 z-20">
            <Trees className="w-5 h-5 text-accent-green" />
            星球地表重建
          </h2>

          {/* Isometric Land Mass */}
          <div className="relative scale-150 mt-10">
            {/* The Land Block */}
            <div className="relative w-48 h-48 rotate-x-[60deg] rotate-z-[45deg] transition-all duration-700 hover:rotate-z-[50deg]">
               {/* Grass Top */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80] to-[#2ecc71] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] rounded-sm" />
               
               {/* Dirt Sides */}
               <div className="absolute top-full left-0 w-full h-8 bg-[#5d4037] origin-top rotate-x-[-90deg]" />
               <div className="absolute top-0 left-full h-full w-8 bg-[#4e342e] origin-left rotate-y-[90deg]" />
               
               {/* Decorative Assets on the Grass */}
               <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-2 pointer-events-none">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center pointer-events-none" style={{ transform: 'rotateZ(-45deg) rotateX(-60deg)', transformOrigin: 'bottom center' }}>
                       <div className="text-2xl -translate-y-8">
                          {i % 5 === 0 ? "🌲" : i % 3 === 0 ? "🌱" : i % 7 === 0 ? "✨" : ""}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Floating Bubble Sprites */}
            <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-10 -right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-sm shadow-xl"
            >
               🌱
            </motion.div>
            <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute top-20 -left-12 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-xs shadow-lg"
            >
               ✨
            </motion.div>
          </div>

          <div className="absolute bottom-10 inset-x-0 flex justify-center gap-8 z-20">
            {stats.map(s => (
              <div key={s.label} className="text-center bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-[9px] text-text-secondary uppercase font-mono tracking-tighter mb-1">{s.label}</div>
                <div className="text-lg font-bold text-white">{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blind Box / Rewards Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="elegant-glass rounded-[2rem] p-8 flex flex-col items-center text-center">
             <div className="bg-accent-blue/10 p-4 rounded-2xl mb-6">
               <Trophy className="w-8 h-8 text-accent-blue" />
             </div>
             <h3 className="text-lg font-bold mb-2">近期专注表现</h3>
             <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${streak >= i ? "bg-accent-green border-accent-green text-black font-bold" : "bg-white/5 border-white/10 text-white/20"}`}>
                    {i}
                  </div>
                ))}
             </div>
             <p className="text-xs text-text-secondary leading-relaxed">
               还差 <span className="text-white font-bold">{3 - streak}</span> 次连续专注即可解锁下一个盲盒礼物
             </p>
          </div>

          <motion.button
            whileHover={streak >= 3 ? { scale: 1.02 } : {}}
            whileTap={streak >= 3 ? { scale: 0.98 } : {}}
            disabled={streak < 3}
            onClick={() => setShowBlindBox(true)}
            className={`w-full p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all overflow-hidden relative group
              ${streak >= 3 ? "border-accent-blue bg-accent-blue/5 cursor-pointer" : "border-white/10 cursor-not-allowed opacity-50"}
            `}
          >
            <div className="relative">
              <Gift className={`w-10 h-10 transition-transform ${streak >= 3 ? "text-accent-blue group-hover:rotate-12" : "text-white/20"}`} />
              {streak < 3 && <Lock className="absolute -top-1 -right-1 w-4 h-4 text-white/40" />}
            </div>
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-[0.2em]">赛博盲盒</div>
              <div className="text-[10px] text-text-secondary mt-1 tracking-tight">Focus Reward Box</div>
            </div>

            {streak >= 3 && (
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/10 rounded-bl-full flex items-center justify-center">
                 <Sparkles className="w-4 h-4 text-accent-blue" />
              </div>
            )}
          </motion.button>
        </div>
      </main>

      {/* Blind Box Reveal Modal */}
      <AnimatePresence>
        {showBlindBox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="elegant-glass p-12 rounded-[4rem] max-w-sm w-full text-center relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent-blue rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                 <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4 text-white mt-8 tracking-tighter">恭喜唤醒者！</h2>
              <p className="text-text-secondary text-sm mb-8">你坚定意志驱动了星球奇迹，解锁了新款【发光树种】</p>
              
              <div className="bg-white/5 rounded-3xl p-8 mb-8 border border-white/5">
                 <div className="text-6xl mb-2">🌲</div>
                 <div className="text-xs font-mono text-accent-green uppercase tracking-widest">Glow Tree Seeds v2</div>
              </div>

              <button 
                onClick={() => {
                  setShowBlindBox(false);
                  localStorage.setItem("focus_streak", "0");
                  setStreak(0);
                }}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all"
              >
                收纳至地表
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

