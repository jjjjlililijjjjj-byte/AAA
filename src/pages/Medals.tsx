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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">勋章馆</h1>
          <p className="text-sm md:text-base text-text-muted">记录你的每一个闪光时刻。</p>
        </div>
        <div className="flex items-center gap-3 bg-surface px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-border shadow-sm w-full md:w-auto">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Sparkles size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-text-muted font-medium">灵感种子</p>
            <p className="text-xl md:text-2xl font-bold font-mono">{userStats.seeds}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pr-1 md:pr-2 pb-4 md:pb-0">
        {userStats.medals.map(medal => (
          <motion.div
            key={medal.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "relative bg-surface p-6 md:p-8 rounded-2xl md:rounded-3xl border shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md",
              medal.unlocked ? "border-primary/50" : "border-border opacity-70 grayscale"
            )}
          >
            <div className={cn(
              "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner",
              medal.unlocked ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary" : "bg-bg text-text-muted"
            )}>
              {getIcon(medal.icon)}
            </div>
            
            <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{medal.name}</h3>
            <p className="text-xs md:text-sm text-text-muted mb-4 md:mb-6 flex-1">{medal.description}</p>

            {medal.unlocked ? (
              <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base">
                <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
                已获得
              </div>
            ) : medal.cost ? (
              <button
                onClick={() => unlockMedal(medal.id)}
                disabled={userStats.seeds < medal.cost}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all text-sm md:text-base",
                  userStats.seeds >= medal.cost
                    ? "bg-primary text-white hover:bg-opacity-90 shadow-md hover:scale-105"
                    : "bg-bg text-text-muted border border-border cursor-not-allowed"
                )}
              >
                <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
                {medal.cost} 兑换
              </button>
            ) : (
              <div className="flex items-center gap-2 text-text-muted font-medium bg-bg px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border text-sm md:text-base">
                <Lock size={16} className="md:w-[18px] md:h-[18px]" />
                未解锁
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
