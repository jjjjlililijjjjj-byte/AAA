import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const RewardPopup: React.FC = () => {
  const { rewardPopup, setRewardPopup } = useAppContext();

  return (
    <AnimatePresence>
      {rewardPopup?.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => setRewardPopup(null)}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
          <div 
            className="relative bg-surface p-8 rounded-3xl shadow-2xl border border-border flex flex-col items-center gap-4 text-center max-w-sm w-full mx-4 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setRewardPopup(null);
            }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
              <Sparkles size={32} />
            </div>
            <h3 className="text-2xl font-bold text-text">任务完成！</h3>
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-bg p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Target size={18} />
                    <span>目标进度</span>
                  </div>
                  <span className="font-bold text-primary">+{rewardPopup.increment}%</span>
                </div>
                {rewardPopup.goal && (
                  <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="h-2.5 rounded-full"
                      style={{ backgroundColor: rewardPopup.goal.color || 'var(--primary)' }}
                      initial={{ width: `${((rewardPopup.goal.completedTasks - 1) / rewardPopup.goal.totalTasks) * 100}%` }}
                      animate={{ width: `${(rewardPopup.goal.completedTasks / rewardPopup.goal.totalTasks) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between bg-bg p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-text-muted">
                  <Sparkles size={18} />
                  <span>灵感种子</span>
                </div>
                <span className="font-bold text-yellow-600">+{rewardPopup.seeds}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
