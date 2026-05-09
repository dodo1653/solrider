import { motion } from 'framer-motion';
import { useAppStore } from '../store';

export function BootSequence() {
  const { isBooting, setBooting } = useAppStore();

  const handleComplete = () => {
    setTimeout(() => {
      setBooting(false);
    }, 500);
  };

  if (!isBooting) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-void-black flex items-center justify-center"
      onAnimationComplete={handleComplete}
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-2xl bg-void-surface border border-void-border flex items-center justify-center">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.2)',
                    '0 0 40px rgba(0, 255, 255, 0.4)',
                    '0 0 20px rgba(0, 255, 255, 0.2)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-accent-cyan"
                />
              </motion.div>
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold tracking-wider text-text-primary"
            >
              VOID
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="w-1.5 h-1.5 rounded-full bg-accent-cyan"
              />
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.5 }}
            className="text-[10px] text-text-muted tracking-widest uppercase"
          >
            initializing system
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.03)_0%,_transparent_50%)]" />
      </div>
    </motion.div>
  );
}