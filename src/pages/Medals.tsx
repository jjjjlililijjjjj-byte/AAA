import React from 'react';
import { motion } from 'motion/react';
import { Medal as MedalIcon, Sparkles, Lock, CheckCircle2, Sunrise, Waves, Grid, Clock, Palette } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';

export const Medals: React.FC = () => {
  const { userStats, unlockMedal } = useAppContext();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise size={32} />;
      case 'Waves': return <Waves size={32} />;
      case 'Grid': return <Grid size={32} />;
      case 'Clock': return <Clock size={32} />;
      case 'Palette': return <Palette size={32} />;
      default: return <MedalIcon size={32} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">勋章馆</h1>
          <p className="text-text-muted">记录你的每一个闪光时刻。</p>
        </div>
        <div className="flex items-center gap-3 bg-surface px-6 py-3 rounded-2xl border border-border shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">灵感种子</p>
            <p className="text-2xl font-bold font-mono">{userStats.seeds}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
        {userStats.medals.map(medal => (
          <motion.div
            key={medal.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "relative bg-surface p-8 rounded-3xl border shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md",
              medal.unlocked ? "border-primary/50" : "border-border opacity-70 grayscale"
            )}
          >
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner",
              medal.unlocked ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary" : "bg-bg text-text-muted"
            )}>
              {getIcon(medal.icon)}
            </div>
            
            <h3 className="text-xl font-bold mb-2">{medal.name}</h3>
            <p className="text-sm text-text-muted mb-6 flex-1">{medal.description}</p>

            {medal.unlocked ? (
              <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-full">
                <CheckCircle2 size={18} />
                已获得
              </div>
            ) : medal.cost ? (
              <button
                onClick={() => unlockMedal(medal.id)}
                disabled={userStats.seeds < medal.cost}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all",
                  userStats.seeds >= medal.cost
                    ? "bg-primary text-white hover:bg-opacity-90 shadow-md hover:scale-105"
                    : "bg-bg text-text-muted border border-border cursor-not-allowed"
                )}
              >
                <Sparkles size={18} />
                {medal.cost} 兑换
              </button>
            ) : (
              <div className="flex items-center gap-2 text-text-muted font-medium bg-bg px-4 py-2 rounded-full border border-border">
                <Lock size={18} />
                未解锁
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
