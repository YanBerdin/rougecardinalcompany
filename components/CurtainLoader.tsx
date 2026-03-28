import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CurtainLoaderProps {
  onComplete: () => void;
}

const CurtainLoader = ({ onComplete }: CurtainLoaderProps) => {
  const [phase, setPhase] = useState<"loading" | "opening" | "done">("loading");

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("opening"), 2200);
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left curtain */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-curtain-gradient z-10"
            animate={phase === "opening" ? { x: "-100%" } : { x: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Curtain folds */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0 border-r border-curtain-deep"
                  style={{ left: `${(i + 1) * 16.66}%`, opacity: 0.3 + i * 0.1 }}
                />
              ))}
            </div>
            {/* Gold trim */}
            <div className="absolute right-0 inset-y-0 w-1 bg-gradient-to-b from-gold-dark via-gold-light to-gold-dark opacity-60" />
          </motion.div>

          {/* Right curtain */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-curtain-gradient z-10"
            animate={phase === "opening" ? { x: "100%" } : { x: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0 border-l border-curtain-deep"
                  style={{ right: `${(i + 1) * 16.66}%`, opacity: 0.3 + i * 0.1 }}
                />
              ))}
            </div>
            <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-gold-dark via-gold-light to-gold-dark opacity-60" />
          </motion.div>

          {/* Center content */}
          <motion.div
            className="relative z-20 text-center"
            animate={phase === "opening" ? { opacity: 0, scale: 1.1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Spotlight glow */}
            <motion.div
              className="absolute -inset-20 rounded-full bg-gold/5 blur-3xl animate-spotlight"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <h2 className="font-display text-2xl md:text-3xl tracking-[0.3em] uppercase text-gold-light mb-4">
                La Compagnie Rouge Cardinal présente...
              </h2>
              
              {/* Loading bar */}
              <div className="w-48 mx-auto h-px bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Dark backdrop behind curtains — noir pour éviter le flash background light */}
          <div className="absolute inset-0 bg-black" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CurtainLoader;
