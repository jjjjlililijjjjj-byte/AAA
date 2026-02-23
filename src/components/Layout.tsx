import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';
import { RewardPopup } from './RewardPopup';
import { motion } from 'motion/react';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-bg text-text overflow-hidden font-sans transition-colors duration-300">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopNav />
      <main className="flex-1 overflow-y-auto relative pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0 pt-[calc(env(safe-area-inset-top)+4rem)] md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full p-4 md:p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
      <BottomNav />
      <RewardPopup />
    </div>
  );
};
