import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Target, BarChart2, Clock, Settings, Medal, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';

export const Sidebar: React.FC = () => {
  const { userStats } = useAppContext();

  const navItems = [
    { icon: Calendar, label: '时间轴', path: '/' },
    { icon: Target, label: '目标', path: '/goals' },
    { icon: BarChart2, label: '统计', path: '/stats' },
    { icon: Clock, label: '专注', path: '/focus' },
  ];

  return (
    <aside className="w-64 h-[100dvh] bg-surface border-r border-border flex flex-col transition-colors duration-300">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transform -rotate-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transform rotate-6">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-text">SereneFlow</span>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-bg rounded-xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <span className="font-medium">{userStats.seeds} 种子</span>
          </div>
          <NavLink to="/medals" className="text-text-muted hover:text-primary transition-colors">
            <Medal size={20} />
          </NavLink>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive 
                ? "bg-primary text-white shadow-sm" 
                : "text-text-muted hover:bg-bg hover:text-text"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            isActive 
              ? "bg-primary text-white shadow-sm" 
              : "text-text-muted hover:bg-bg hover:text-text"
          )}
        >
          <Settings size={20} />
          <span className="font-medium">设置</span>
        </NavLink>
      </div>
    </aside>
  );
};
