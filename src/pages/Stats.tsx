import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, Calendar as CalendarIcon, ChevronDown, Activity, Clock, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../utils/cn';

export const Stats: React.FC = () => {
  const { tasks, userStats } = useAppContext();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const nextPeriod = () => {
    if (timeRange === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (timeRange === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const generateData = () => {
    const data = [];
    if (timeRange === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const date = addDays(start, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.date === dateStr);
        data.push({
          name: format(date, 'MM/dd'),
          completed: dayTasks.filter(t => t.completed).length,
          uncompleted: dayTasks.filter(t => !t.completed).length,
        });
      }
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      
      weeks.forEach(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        let completed = 0;
        let uncompleted = 0;
        
        for (let j = 0; j < 7; j++) {
          const date = addDays(weekStart, j);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.date === dateStr);
          completed += dayTasks.filter(t => t.completed).length;
          uncompleted += dayTasks.filter(t => !t.completed).length;
        }
        
        data.push({
          name: `${format(weekStart, 'MM/dd')}-${format(weekEnd, 'MM/dd')}`,
          completed,
          uncompleted,
        });
      });
    }
    return data;
  };

  const data = generateData();

  const periodTasks = React.useMemo(() => {
    if (timeRange === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return tasks.filter(t => t.date >= format(start, 'yyyy-MM-dd') && t.date <= format(end, 'yyyy-MM-dd'));
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return tasks.filter(t => t.date >= format(start, 'yyyy-MM-dd') && t.date <= format(end, 'yyyy-MM-dd'));
    }
  }, [tasks, currentDate, timeRange]);

  const calculateFlowIndex = () => {
    // F = (sum(Ti * Wi) / Ttotal) * GoalRate
    // Simplified for demo
    const completedTasks = periodTasks.filter(t => t.completed);
    if (completedTasks.length === 0) return 0;
    
    let weightedTime = 0;
    let totalTime = 0;
    const weights = { A: 1.5, B: 1.2, C: 0.8, D: 0.5 };
    
    completedTasks.forEach(t => {
      const duration = t.duration || 60;
      weightedTime += duration * weights[t.quadrant];
      totalTime += duration;
    });
    
    const goalRate = 0.8; // Mock goal rate
    const flowIndex = (weightedTime / totalTime) * goalRate * 100;
    return flowIndex.toFixed(1);
  };

  const getPeriodLabel = () => {
    if (timeRange === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'yyyy年MM月dd日')} - ${format(end, 'MM月dd日')}`;
    } else {
      return format(currentDate, 'yyyy年MM月', { locale: zhCN });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">统计中心</h1>
          <p className="text-sm md:text-base text-text-muted">洞察你的时间流转与效率。</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center justify-between sm:justify-center gap-2 md:gap-4 bg-surface px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border">
            <button onClick={prevPeriod} className="text-text-muted hover:text-primary transition-colors p-2">
              <ChevronLeft size={20} className="md:w-5 md:h-5" />
            </button>
            <span className="font-medium text-sm md:text-base min-w-[140px] md:min-w-[180px] text-center">
              {getPeriodLabel()}
            </span>
            <button onClick={nextPeriod} className="text-text-muted hover:text-primary transition-colors p-2">
              <ChevronRight size={20} className="md:w-5 md:h-5" />
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-text hover:border-primary transition-colors text-sm md:text-base"
            >
              <CalendarIcon size={16} className="md:w-[18px] md:h-[18px]" />
              {timeRange === 'week' ? '每周数据' : '每月数据'}
              <ChevronDown size={14} className={cn("md:w-4 md:h-4 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full pt-2 w-full sm:w-32 z-20"
                  >
                    <div className="bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                      <button 
                        onClick={() => {
                          setTimeRange('week');
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-bg transition-colors",
                          timeRange === 'week' ? "text-primary font-medium bg-primary/5" : "text-text"
                        )}
                      >
                        每周数据
                      </button>
                      <button 
                        onClick={() => {
                          setTimeRange('month');
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 md:py-2 text-sm hover:bg-bg transition-colors",
                          timeRange === 'month' ? "text-primary font-medium bg-primary/5" : "text-text"
                        )}
                      >
                        每月数据
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm flex items-center gap-3 md:gap-4"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Activity size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-text-muted mb-0.5 md:mb-1">流转指数 (F)</p>
            <p className="text-2xl md:text-3xl font-bold font-mono">{calculateFlowIndex()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm flex items-center gap-3 md:gap-4"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-text-muted mb-0.5 md:mb-1">累计专注时长</p>
            <p className="text-2xl md:text-3xl font-bold font-mono">{Math.floor(userStats.focusTime / 60)}<span className="text-base md:text-lg text-text-muted font-sans ml-1">h</span> {userStats.focusTime % 60}<span className="text-base md:text-lg text-text-muted font-sans ml-1">m</span></p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm flex items-center gap-3 md:gap-4 sm:col-span-2 md:col-span-1"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
            <Target size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-text-muted mb-0.5 md:mb-1">任务完成率</p>
            <p className="text-2xl md:text-3xl font-bold font-mono">
              {periodTasks.length > 0 ? Math.round((periodTasks.filter(t => t.completed).length / periodTasks.length) * 100) : 0}%
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 bg-surface rounded-2xl md:rounded-3xl border border-border shadow-sm p-4 md:p-6 flex flex-col min-h-[300px]">
        <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
          <BarChart2 size={18} className="text-primary md:w-5 md:h-5" />
          任务完成曲线
        </h3>
        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: 'var(--text)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="completed" name="已完成" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="uncompleted" name="未完成" stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
