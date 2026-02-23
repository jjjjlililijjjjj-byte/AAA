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
      <main className="flex-1 flex flex-col overflow-y-auto relative pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0 pt-[calc(env(safe-area-inset-top)+4rem)] md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 w-full p-4 md:p-8 max-w-7xl mx-auto flex flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
      <BottomNav />
      <RewardPopup />
    </div>
  );
};
