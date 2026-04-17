import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Pause, RotateCcw, Monitor, Dumbbell, Info, Hexagon } from "lucide-react";
import PlanetCanvas from "../components/PlanetCanvas";

type Mode = "learning" | "sports";
type TimerType = "positive" | "countdown";
type AppStatus = "idle" | "selecting" | "focusing";

export default function Focus() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AppStatus>("selecting");
  const [mode, setMode] = useState<Mode>("learning");
  const [timerType, setTimerType] = useState<TimerType>("positive");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket Sync for M5Stack
  const [deviceConnected, setDeviceConnected] = useState(false);

  useEffect(() => {
    // Determine WS protocol based on window location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Connected to FlowCube Server [WS]");
        ws?.send(JSON.stringify({ type: "handshake", client_type: "ui" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "device_status") {
             setDeviceConnected(data.connected);
          }
          if (data.type === "orientation") {
            const { orientation } = data;
            console.log("M5Stack Command:", orientation);
            
            if (orientation === "study") {
              setMode("learning");
              if (status !== "focusing") {
                startFocus();
              } else {
                setIsActive(true);
              }
            } else if (orientation === "exercise") {
              setMode("sports");
              if (status !== "focusing") {
                startFocus();
              } else {
                setIsActive(true);
              }
            } else if (orientation === "pause") {
              setIsActive(false);
            } else if (orientation === "rest") {
               resetTimer();
            }
          }
        } catch (e) {
          console.error("WS Message Error:", e);
        }
      };

      ws.onclose = () => {
        console.log("WS Disconnected. Retrying...");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WS Error:", err);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [status]);

  const startFocus = () => {
    setStatus("focusing");
    setIsActive(true);
    if (timerType === "countdown" && seconds === 0) {
      setSeconds(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    // Increment streak on completion/reset when in focusing status
    if (status === "focusing") {
      const currentStreak = parseInt(localStorage.getItem("focus_streak") || "0");
      localStorage.setItem("focus_streak", (currentStreak + 1).toString());
      
      // Dispatch event for SpiritOverlay
      window.dispatchEvent(new CustomEvent("focus-session-finished"));
    }
    
    setIsActive(false);
    setSeconds(0);
    setStatus("selecting");
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (timerType === "positive") return prev + 1;
          if (prev <= 0) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timerType]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-deep flex flex-col font-sans">
      {/* Background 3D View */}
      <div className="absolute inset-0 z-0">
        <PlanetCanvas focusSeconds={seconds} status={status === "focusing" ? "focusing" : "idle"} mode={mode} />
      </div>

      {/* Top Header Navigation - Elegant Dark Style */}
      <header className="fixed top-0 left-0 w-full h-[60px] px-10 flex justify-between items-center elegant-glass z-50">
        <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <button 
            onClick={() => navigate("/")}
            className="hover:text-accent-blue transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-blue rounded flex items-center justify-center">
               <Hexagon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white tracking-widest text-sm font-black">FLOWCUBE</span>
          </div>
        </div>
        <div className={`status-pill px-3 py-1 flex items-center gap-2 transition-all ${deviceConnected ? "text-accent-green" : "text-text-secondary/50"}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${deviceConnected ? "bg-accent-green" : "bg-gray-500"}`} />
          {deviceConnected ? "M5STACK CORE2 CONNECTED" : "DEVICE DISCONNECTED"}
        </div>
      </header>

      {/* Elegant Digital Clock Overlay (Top Right) */}
      <div className="absolute top-[100px] right-10 z-10 text-right font-mono pointer-events-none">
        <div className="text-6xl font-bold tracking-tighter text-white opacity-90 transition-all duration-300">
          {formatTime(seconds)}
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-text-secondary mt-1">
          {timerType === "positive" ? "Time Focused" : "Time Remaining"}
        </div>
      </div>

      {/* Session Info (Bottom Left) */}
      <AnimatePresence>
        {status === "focusing" && (
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute left-10 bottom-10 z-10 flex flex-col gap-2 pointer-events-none"
          >
            <div className="bg-accent-blue text-[10px] font-bold px-3 py-1 rounded text-white w-fit uppercase tracking-widest leading-none">
              Current Session
            </div>
            <h1 className="text-4xl font-light tracking-tight text-white mb-1">
              {mode === "learning" ? "Study Mode" : "Exercise Mode"}
            </h1>
            <p className="text-text-secondary text-sm max-w-[320px] leading-relaxed">
              Repairing Sector 7-G. Your focus energy is regenerating the planetary ecosystem.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 z-10 flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {status === "selecting" && (
            <motion.div 
              key="selection"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="elegant-glass p-10 rounded-[2rem] w-full max-w-sm flex flex-col gap-8 pointer-events-auto"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1 tracking-tight">Select Protocol</h2>
                <p className="text-text-secondary text-sm">Energy will be converted to planetary nutrients</p>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
                <button 
                  onClick={() => setMode("learning")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${mode === "learning" ? "bg-accent-blue text-white font-bold" : "text-text-secondary hover:text-white"}`}
                >
                  <Monitor className="w-4 h-4" /> STUDY
                </button>
                <button 
                  onClick={() => setMode("sports")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${mode === "sports" ? "bg-accent-blue text-white font-bold" : "text-text-secondary hover:text-white"}`}
                >
                  <Dumbbell className="w-4 h-4" /> SPORTS
                </button>
              </div>

              {/* Timer Type Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
                <button 
                  onClick={() => setTimerType("positive")}
                  className={`py-3 rounded-lg text-xs tracking-widest font-mono transition-all ${timerType === "positive" ? "text-accent-blue border-b-2 border-accent-blue" : "text-text-secondary hover:text-white"}`}
                >
                  UP-TIMER
                </button>
                <button 
                  onClick={() => setTimerType("countdown")}
                  className={`py-3 rounded-lg text-xs tracking-widest font-mono transition-all ${timerType === "countdown" ? "text-accent-blue border-b-2 border-accent-blue" : "text-text-secondary hover:text-white"}`}
                >
                  DOWN-TIMER
                </button>
              </div>

              <button 
                onClick={startFocus}
                className="w-full bg-accent-blue hover:bg-blue-400 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                INITIALIZE PORTAL
              </button>

              <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-accent-blue mt-0.5" />
                <p className="text-[10px] text-text-secondary leading-normal uppercase tracking-wider">
                  Hardware linked: Flip M5Stack face down to trigger session automatically.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Overlay during focusing */}
      <AnimatePresence>
        {status === "focusing" && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute right-10 bottom-10 z-10 flex gap-4 pointer-events-auto"
          >
            <button 
              onClick={toggleTimer}
              className="action-card w-16 h-16 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white group"
            >
              {isActive ? <Pause className="w-6 h-6 group-hover:text-accent-blue" /> : <Play className="w-6 h-6 group-hover:text-accent-blue" />}
            </button>
            <button 
              onClick={resetTimer}
              className="action-card w-16 h-16 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-text-secondary hover:text-white"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Grids or lines can go here */}
    </div>
  );
}
