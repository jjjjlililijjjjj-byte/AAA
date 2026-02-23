import React, { createContext, useContext, useState, useEffect } from 'react';

export type Quadrant = 'A' | 'B' | 'C' | 'D';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  quadrant: Quadrant;
  completed: boolean;
  goalId?: string;
  duration?: number; // in minutes
  repeat?: RepeatType;
  repeatCustomDays?: number[]; // 0-6 for Sunday-Saturday
  parentId?: string; // If this is a generated instance of a repeating task
}

export interface Goal {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  status: 'active' | 'completed';
  color?: string;
  unit?: string;
}

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  cost?: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
}

export interface UserStats {
  seeds: number;
  focusTime: number; // in minutes
  theme: 'default' | 'wilderness' | 'twilight' | 'northern' | 'matcha' | 'lavender' | 'rose';
  medals: Medal[];
  profile: UserProfile;
}

interface AppContextType {
  tasks: Task[];
  goals: Goal[];
  userStats: UserStats;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'completedTasks' | 'status'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addFocusTime: (minutes: number) => void;
  addSeeds: (amount: number) => void;
  setTheme: (theme: UserStats['theme']) => void;
  unlockMedal: (medalId: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  rewardPopup: { show: boolean; increment: number; seeds: number; goal?: Goal } | null;
  setRewardPopup: (popup: { show: boolean; increment: number; seeds: number; goal?: Goal } | null) => void;
}

const defaultMedals: Medal[] = [
  { id: 'm1', name: '晨曦使者', description: '连续 7 天在 8:00 前完成首个任务', icon: 'Sunrise', unlocked: false },
  { id: 'm2', name: '深海潜行', description: '专注时长累计达到 100 小时', icon: 'Waves', unlocked: false },
  { id: 'm3', name: '四象平衡', description: 'A/B/C/D 四类任务完成率均达 80%', icon: 'Grid', unlocked: false },
  { id: 'm4', name: '岁月静好', description: '账号注册满一周年 (500 种子兑换)', icon: 'Clock', unlocked: false, cost: 500 },
  { id: 'm5', name: '莫兰迪匠心', description: '收集满 5 套外观主题 (1000 种子兑换)', icon: 'Palette', unlocked: false, cost: 1000 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '完成PRD初稿', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '11:00', quadrant: 'A', completed: false, duration: 120, repeat: 'none' },
    { id: '2', title: '阅读《设计心理学》', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', quadrant: 'B', completed: false, goalId: 'g1', duration: 60, repeat: 'none' },
  ]);
  
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', title: '阅读 5 本书', totalTasks: 5, completedTasks: 2, status: 'active' },
  ]);

  const [userStats, setUserStats] = useState<UserStats>({
    seeds: 120,
    focusTime: 340,
    theme: 'default',
    medals: defaultMedals,
    profile: {
      name: '探索者',
    }
  });

  const [rewardPopup, setRewardPopup] = useState<{ show: boolean; increment: number; seeds: number; goal?: Goal } | null>(null);

  useEffect(() => {
    document.documentElement.className = userStats.theme === 'default' ? '' : `theme-${userStats.theme}`;
  }, [userStats.theme]);

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    setUserStats(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates }
    }));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const updatedTask = { ...t, ...updates };
        // If task is completed and has a goal, update goal
        if (!t.completed && updatedTask.completed && updatedTask.goalId) {
          const goal = goals.find(g => g.id === updatedTask.goalId);
          if (goal) {
            const newCompleted = goal.completedTasks + 1;
            const increment = Math.round((1 / goal.totalTasks) * 100);
            const seedsEarned = 10;
            
            const updatedGoal = { 
              ...goal,
              completedTasks: newCompleted,
              status: newCompleted >= goal.totalTasks ? 'completed' : 'active'
            } as Goal;

            updateGoal(goal.id, updatedGoal);
            
            addSeeds(seedsEarned);
            setRewardPopup({ show: true, increment, seeds: seedsEarned, goal: updatedGoal });
            setTimeout(() => setRewardPopup(null), 3000);
          }
        }
        return updatedTask;
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id && t.parentId !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'completedTasks' | 'status'>) => {
    setGoals([...goals, { ...goal, id: Date.now().toString(), completedTasks: 0, status: 'active' }]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    // Also remove goalId from tasks associated with this goal
    setTasks(tasks.map(t => t.goalId === id ? { ...t, goalId: undefined } : t));
  };

  const addFocusTime = (minutes: number) => {
    setUserStats(prev => ({ ...prev, focusTime: prev.focusTime + minutes }));
  };

  const addSeeds = (amount: number) => {
    setUserStats(prev => ({ ...prev, seeds: prev.seeds + amount }));
  };

  const setTheme = (theme: UserStats['theme']) => {
    setUserStats(prev => ({ ...prev, theme }));
  };

  const unlockMedal = (medalId: string) => {
    setUserStats(prev => {
      const medal = prev.medals.find(m => m.id === medalId);
      if (medal && !medal.unlocked && medal.cost && prev.seeds >= medal.cost) {
        return {
          ...prev,
          seeds: prev.seeds - medal.cost,
          medals: prev.medals.map(m => m.id === medalId ? { ...m, unlocked: true } : m)
        };
      }
      return prev;
    });
  };

  return (
    <AppContext.Provider value={{
      tasks, goals, userStats,
      addTask, updateTask, deleteTask,
      addGoal, updateGoal, deleteGoal,
      addFocusTime, addSeeds, setTheme, unlockMedal, updateProfile,
      rewardPopup, setRewardPopup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
