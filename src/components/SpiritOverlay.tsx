import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Sparkles } from "lucide-react";

const MESSAGES = [
  "你刚刚专注了，星球上的小兔子托我向你问好，快去喝杯水吧！",
  "专注的时光里，又有一棵小树悄悄发芽了呢。",
  "辛苦啦！你的专注能量让星球的大气层变得更明亮了。",
  "深呼吸一下，感觉到了吗？那是星球对你的感谢。",
  "哪怕是一点点的专注，也是在为荒星注入生命力。",
  "你在努力的时候，宇宙中的星星也在为你加油哦。",
  "休息一会儿吧，过度消耗能量会导致星球平衡失稳的。",
  "小精灵看到你在发光，那是坚持的力量。",
  "听，那是风在吹过刚长出的小草，沙沙作响。",
  "完成了！现在的你比刚才更强大了一些。",
  "星球的生态系统正在因为你的努力而悄悄演化。",
  "你是这个世界的造物主，每一分每一秒都在塑造未来。",
  "累了吗？闭上眼感受一下你创造的小小绿洲。",
  "卓越的专注力！你刚才的能量波及到了邻近的星系。",
  "坚持住，奇迹往往发生在最后那几秒钟。",
  "你的每次专注都是对这颗赛博荒星的一次温柔拥抱。",
  "小兔子说它最喜欢看你专注的样子了。",
  "让心静下来，像深海里的水，专注且深邃。",
  "恭喜！星球的含氧量又回升了 0.01%。",
  "记得给自己一个微笑，你是星球的救赎者。"
];

export default function SpiritOverlay() {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleFocusFinished = () => {
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setMessage(randomMsg);
      // Auto hide after 8 seconds
      setTimeout(() => setMessage(null), 8000);
    };

    window.addEventListener("focus-session-finished", handleFocusFinished);
    
    // Potentially random messages too
    const interval = setInterval(() => {
        if (Math.random() > 0.7 && !message) {
            handleFocusFinished();
        }
    }, 30000);

    return () => {
      window.removeEventListener("focus-session-finished", handleFocusFinished);
      clearInterval(interval);
    };
  }, [message]);

  return (
    <div className="fixed bottom-10 right-10 z-[100] pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-64 p-4 elegant-glass rounded-2xl border-accent-blue/30 pointer-events-auto"
          >
            <div className="text-xs text-white leading-relaxed">
              {message}
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 elegant-glass border-t-0 border-l-0 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-auto cursor-pointer group"
        onClick={() => {
            const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            setMessage(randomMsg);
            setTimeout(() => setMessage(null), 5000);
        }}
      >
        <div className="relative">
          {/* Sprite Body */}
          <div className="w-12 h-12 bg-accent-blue rounded-full shadow-[0_0_20px_#3b82f666] flex items-center justify-center border-2 border-white/20 overflow-hidden">
             <div className="w-8 h-8 flex flex-col items-center justify-center">
                <div className="flex gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div className="w-3 h-1 bg-white/40 rounded-full" />
             </div>
          </div>
          {/* Hat */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
             <div className="w-10 h-6 bg-white rounded-full flex items-center justify-center relative shadow-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full absolute -top-1" />
             </div>
          </div>
          {/* Magic Trail */}
          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-accent-blue animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
