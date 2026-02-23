import React from 'react';
import { Sparkles, Medal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const TopNav: React.FC = () => {
  const { userStats } = useAppContext();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[calc(env(safe-area-inset-top)+4rem)] bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40 pt-safe">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transform -rotate-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transform rotate-6">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight text-text">SereneFlow</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-1.5 rounded-full text-sm font-medium">
          <Sparkles size={14} />
          <span>{userStats.seeds}</span>
        </div>
        <NavLink to="/medals" className="text-text-muted hover:text-primary transition-colors p-1">
          <Medal size={20} />
        </NavLink>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
          {userStats.profile.avatar ? (
            <img src={userStats.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            userStats.profile.name.charAt(0)
          )}
        </div>
      </div>
    </header>
  );
};
