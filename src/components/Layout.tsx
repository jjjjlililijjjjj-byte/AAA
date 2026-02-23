import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RewardPopup } from './RewardPopup';
import { motion } from 'motion/react';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden font-sans transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
      <RewardPopup />
    </div>
  );
};
