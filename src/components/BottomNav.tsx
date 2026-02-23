import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Target, BarChart2, Clock, Settings, Medal } from 'lucide-react';
import { cn } from '../utils/cn';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Calendar, label: '时间轴', path: '/' },
    { icon: Target, label: '目标', path: '/goals' },
    { icon: Clock, label: '专注', path: '/focus' },
    { icon: BarChart2, label: '统计', path: '/stats' },
    { icon: Settings, label: '设置', path: '/settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200",
            isActive 
              ? "text-primary" 
              : "text-text-muted hover:text-text"
          )}
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70"
              )}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
