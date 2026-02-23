import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, Settings2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';

export const Focus: React.FC = () => {
  const { addFocusTime } = useAppContext();
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(duration * 60);
    }
  }, [duration, status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'running') {
      setStatus('idle');
      addFocusTime(duration);
    }
    return () => clearInterval(interval);
  }, [status, timeLeft, duration, addFocusTime]);

  const toggleTimer = () => {
    if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  };

  const stopTimer = () => {
    setStatus('idle');
    setTimeLeft(duration * 60);
  };

  const handleDurationChange = (newDuration: number) => {
    const validDuration = Math.max(1, Math.min(120, newDuration));
    setDuration(validDuration);
    if (status === 'paused') {
      // Adjust timeLeft proportionally or just set it to new duration?
      // Let's just set it to the new duration for simplicity, or add the difference
      // Actually, if they change duration while paused, let's reset to the new duration
      setTimeLeft(validDuration * 60);
      setStatus('idle');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden rounded-3xl bg-surface border border-border shadow-sm transition-colors duration-1000">
      {/* Dynamic Background elements - Only visible when active */}
      <AnimatePresence>
        {status === 'running' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] animate-blob bg-[var(--quad-a)]" />
            <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 bg-[var(--quad-b)]" />
            <div className="absolute bottom-1/4 left-1/3 w-[40rem] h-[40rem] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 bg-[var(--quad-c)]" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-surface/40 pointer-events-none backdrop-blur-[2px]" />

      <div className="absolute top-8 right-8 z-20">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-3 rounded-xl border transition-all backdrop-blur-sm",
            showSettings ? "bg-primary text-white border-primary" : "bg-surface/50 text-text-muted border-border hover:bg-surface"
          )}
        >
          <Settings2 size={24} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 right-8 z-20 bg-surface/90 backdrop-blur-md p-6 rounded-3xl border border-border shadow-xl w-80"
          >
            <div>
              <h3 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">专注时长</h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[15, 25, 45, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => { setDuration(m); setStatus('idle'); }}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium transition-colors",
                      duration === m ? "bg-primary text-white" : "bg-bg text-text-muted hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  max="120"
                  value={duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0 && val <= 120) {
                      setDuration(val);
                      setStatus('idle');
                    }
                  }}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary transition-colors"
                />
                <span className="text-text-muted text-sm whitespace-nowrap">分钟</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="z-10 flex flex-col items-center">
        <div className="relative w-80 h-80 flex items-center justify-center mb-16">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              stroke="var(--border)"
              strokeWidth="4"
              fill="none"
              className="opacity-50"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="150"
              stroke="var(--primary)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 150}
              strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 150 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 150 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>

          <div className="text-center">
            <div className="text-7xl font-mono font-light tracking-tighter mb-4 text-text drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
            {status !== 'running' && (
              <div className="flex items-center justify-center gap-4 text-text-muted">
                <button onClick={() => handleDurationChange(duration - 5)} className="hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface">-</button>
                <span className="font-medium w-16 text-center">{duration} min</span>
                <button onClick={() => handleDurationChange(duration + 5)} className="hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface">+</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={toggleTimer}
            className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-opacity-90 hover:scale-105 transition-all"
          >
            {status === 'running' ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>

          <button
            onClick={stopTimer}
            disabled={status === 'idle'}
            className={cn(
              "w-14 h-14 rounded-full border flex items-center justify-center transition-all backdrop-blur-sm",
              status === 'idle'
                ? "bg-surface/50 border-border/50 text-border/50 cursor-not-allowed"
                : "bg-surface/80 border-border text-text-muted hover:text-red-500 hover:border-red-500"
            )}
          >
            <Square size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
