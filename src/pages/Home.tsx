import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Globe, Rocket, LogOut, Hexagon } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "focus",
      title: "开始专注",
      description: "修复赛博荒星",
      icon: <Gamepad2 className="w-6 h-6" />,
      path: "/focus",
      sub: "LEVEL 4 AWAKENING",
    },
    {
      id: "planet",
      title: "我的星球",
      description: "查看绿化进度",
      icon: <Globe className="w-6 h-6" />,
      path: "/planet",
      sub: "REPAIRING SECTOR 7-G",
    },
    {
      id: "universe",
      title: "探索宇宙",
      description: "寻找其他唤醒者",
      icon: <Rocket className="w-6 h-6" />,
      path: "/universe",
      sub: "NEARBY SYSTEMS",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-10 overflow-hidden">
      {/* Top Header / Navigation */}
      <header className="fixed top-0 left-0 w-full h-[60px] px-10 flex justify-between items-center elegant-glass z-50">
        <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <Hexagon className="w-6 h-6 text-accent-blue" />
          FlowCube
        </div>
        <div className="status-pill px-3 py-1 flex items-center gap-2 font-mono">
          <div className="pulse-dot" />
          M5STACK CORE2 CONNECTED
        </div>
      </header>

      {/* Main Branding - More Minimal */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-16 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-blue/5 rounded-3xl rotate-12 -z-10 border border-white/5 backdrop-blur-sm" />
        <h1 className="text-7xl font-black tracking-tighter flex items-center justify-center gap-2 text-white">
          FLOW
          <div className="w-16 h-16 bg-accent-blue rounded-2xl flex items-center justify-center shadow-[0_0_30px_#3b82f644] rotate-12">
             <Hexagon className="w-10 h-10 text-white fill-white/20" />
          </div>
          CUBE
        </h1>
        <p className="text-text-secondary font-mono text-xs tracking-[0.4em] uppercase opacity-40 mt-6">
          "REPAIRING THE REPLICANT REALMS"
        </p>
      </motion.div>

      {/* Action Tray - Horizontal arrangement as per design */}
      <div className="z-10 flex flex-wrap justify-center gap-4 w-full max-w-6xl">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="flex-1 min-w-[240px] max-w-[300px]"
          >
            <button
              onClick={() => navigate(item.path)}
              className="w-full text-left action-card p-6 flex flex-col items-center text-center group"
            >
              <div className="mb-4 text-accent-blue group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h2 className="text-text-primary font-bold text-base mb-1 tracking-tight">{item.title}</h2>
              <p className="text-text-secondary text-[11px] mb-4 uppercase tracking-widest">{item.description}</p>
              
              <div className="w-full h-[1px] bg-border-subtle mb-4" />
              
              <div className="text-[10px] font-mono text-text-secondary opacity-50 uppercase tracking-widest">
                {item.sub}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Sign Out - Subtle corner */}
      <button className="fixed top-[18px] right-[240px] z-[60] text-text-secondary hover:text-white transition-colors">
        <LogOut className="w-5 h-5" />
      </button>

      {/* M5Stack Simulator */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <button 
          onClick={async () => {
             await fetch('/api/m5stack/flip', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ orientation: 'down' })
             });
          }}
          className="px-3 py-1.5 status-pill text-[9px] uppercase tracking-widest bg-black/40 hover:bg-black/60 transition-colors"
        >
          SIMULATE FACE DOWN
        </button>
        <button 
          onClick={async () => {
             await fetch('/api/m5stack/flip', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ orientation: 'up' })
             });
          }}
          className="px-3 py-1.5 status-pill text-[9px] uppercase tracking-widest bg-black/40 hover:bg-black/60 transition-colors"
        >
          SIMULATE FACE UP
        </button>
      </div>
    </div>
  );
}

