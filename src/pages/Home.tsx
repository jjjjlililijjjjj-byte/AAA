import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Grid, Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useAppContext, Task, Quadrant } from '../context/AppContext';
import { cn } from '../utils/cn';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getDay, getDate } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TaskModal } from '../components/TaskModal';

export const Home: React.FC = () => {
  const { tasks, updateTask, addTask, deleteTask } = useAppContext();
  const [viewMode, setViewMode] = useState<'timeline' | 'quadrant'>('timeline');
  const [daysView, setDaysView] = useState<'month' | 1 | 2 | 3 | 7>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate task instances for the current view
  const displayTasks = useMemo(() => {
    let start, end;
    if (viewMode === 'timeline') {
      if (daysView === 'month') {
        start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      } else {
        start = currentDate;
        end = addDays(currentDate, daysView as number - 1);
      }
    } else {
      start = currentDate;
      end = currentDate;
    }

    const allDays = eachDayOfInterval({ start, end });
    const generatedTasks: Task[] = [];

    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOfWeek = getDay(day);
      const dayOfMonth = getDate(day);

      tasks.forEach(task => {
        // Skip if task starts after current day
        if (task.date > dayStr) return;

        let shouldInclude = false;

        if (task.date === dayStr) {
          shouldInclude = true;
        } else if (task.repeat === 'daily') {
          shouldInclude = true;
        } else if (task.repeat === 'weekly') {
          const taskStartDay = getDay(parseISO(task.date));
          if (dayOfWeek === taskStartDay) shouldInclude = true;
        } else if (task.repeat === 'monthly') {
          const taskStartDayOfMonth = getDate(parseISO(task.date));
          if (dayOfMonth === taskStartDayOfMonth) shouldInclude = true;
        } else if (task.repeat === 'custom' && task.repeatCustomDays) {
          if (task.repeatCustomDays.includes(dayOfWeek)) shouldInclude = true;
        }

        if (shouldInclude) {
          // Check if there's already an instance for this day (e.g., if it was completed)
          const existingInstance = tasks.find(t => t.parentId === task.id && t.date === dayStr);
          if (existingInstance) {
             // Don't add if the original task is the one we're looking at, to avoid duplicates
             if(task.id !== existingInstance.id) return;
          }

          if (task.date === dayStr) {
             generatedTasks.push(task);
          } else if (!existingInstance) {
            // Generate a virtual instance
            generatedTasks.push({
              ...task,
              id: `${task.id}-${dayStr}`,
              parentId: task.id,
              date: dayStr,
              completed: false, // Virtual instances are uncompleted by default
            });
          }
        }
      });
    });

    return generatedTasks;
  }, [tasks, currentDate, viewMode, daysView]);

  const handleToggleTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.parentId) {
      // If it's a virtual instance, create a real one
      addTask({
        ...task,
        id: undefined as any, // Let context generate ID
        parentId: task.parentId,
        completed: !task.completed,
        repeat: 'none',
        repeatCustomDays: undefined
      });
    } else {
      updateTask(task.id, { completed: !task.completed });
    }
  };

  const openTaskModal = (task?: Task, date?: Date) => {
    // If editing a virtual instance, we edit the parent
    if (task && task.parentId) {
       const parentTask = tasks.find(t => t.id === task.parentId);
       setSelectedTask(parentTask || task);
    } else {
       setSelectedTask(task || null);
    }
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayTasks = displayTasks.filter(t => t.date === format(cloneDay, 'yyyy-MM-dd'));

        days.push(
          <div
            className={cn(
              "min-h-[120px] p-2 border-r border-b border-border/50 transition-colors hover:bg-surface/50 cursor-pointer relative group",
              !isSameMonth(day, monthStart) ? "bg-bg/50 text-text-muted/50" : "bg-surface",
              isSameDay(day, new Date()) ? "bg-primary/5" : ""
            )}
            key={day.toISOString()}
            onClick={() => openTaskModal(undefined, cloneDay)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                isSameDay(day, new Date()) ? "bg-primary text-white" : "text-text-muted group-hover:text-primary transition-colors"
              )}>
                {formattedDate}
              </span>
              <button className="opacity-0 group-hover:opacity-100 text-primary p-1 hover:bg-primary/10 rounded-md transition-all">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
              {dayTasks.map(task => {
                const quadColors = {
                  A: 'bg-[var(--quad-a)]/20 text-[var(--quad-a)] border-[var(--quad-a)]/30',
                  B: 'bg-[var(--quad-b)]/20 text-[var(--quad-b)] border-[var(--quad-b)]/30',
                  C: 'bg-[var(--quad-c)]/20 text-[var(--quad-c)] border-[var(--quad-c)]/30',
                  D: 'bg-[var(--quad-d)]/20 text-[var(--quad-d)] border-[var(--quad-d)]/30',
                };
                return (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openTaskModal(task);
                    }}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md border truncate transition-all hover:opacity-80 flex items-center gap-1",
                      quadColors[task.quadrant],
                      task.completed ? "opacity-50 line-through" : ""
                    )}
                  >
                    <div
                      onClick={(e) => handleToggleTask(task, e)}
                      className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {task.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    </div>
                    <span className="truncate">{task.title}</span>
                    {task.repeat && task.repeat !== 'none' && (
                      <Repeat size={10} className="ml-auto opacity-50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="flex-1 flex flex-col bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border/50 bg-bg/50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-medium text-text-muted">
              周{day}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {rows}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    if (daysView === 'month') return renderMonthView();

    const days = Array.from({ length: daysView as number }).map((_, i) => addDays(currentDate, i));
    const hours = Array.from({ length: 24 }).map((_, i) => i);

    return (
      <div className="flex-1 overflow-y-auto bg-surface rounded-3xl border border-border shadow-sm p-6">
        <div className="relative flex">
          {/* Time scale */}
          <div className="w-16 flex-shrink-0 border-r border-border/50 pr-4">
            {hours.map(h => (
              <div key={h} className="h-20 text-xs text-text-muted text-right pr-2 -mt-2">
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="flex-1 flex divide-x divide-border/50">
            {days.map(day => {
              const dayTasks = displayTasks.filter(t => t.date === format(day, 'yyyy-MM-dd'));
              return (
                <div 
                  key={day.toISOString()} 
                  className="flex-1 relative group cursor-pointer hover:bg-bg/30 transition-colors"
                  onClick={() => openTaskModal(undefined, day)}
                >
                  <div className="text-center pb-4 border-b border-border/50 sticky top-0 bg-surface z-10">
                    <div className="text-sm text-text-muted">{format(day, 'EEEE', { locale: zhCN })}</div>
                    <div className={cn(
                      "text-xl font-bold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-primary text-white" : ""
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="relative h-[1920px] mt-4">
                    {/* Grid lines */}
                    {hours.map(h => (
                      <div key={h} className="absolute w-full border-t border-border/30" style={{ top: `${h * 80}px` }} />
                    ))}
                    
                    {/* Tasks */}
                    {dayTasks.map(task => {
                      if (!task.startTime || !task.endTime) return null;
                      const startHour = parseInt(task.startTime.split(':')[0]);
                      const startMin = parseInt(task.startTime.split(':')[1]);
                      const top = (startHour + startMin / 60) * 80;
                      const duration = task.duration || 60;
                      const height = (duration / 60) * 80;
                      
                      const quadColors = {
                        A: 'bg-[var(--quad-a)]/20 border-[var(--quad-a)] text-[var(--quad-a)]',
                        B: 'bg-[var(--quad-b)]/20 border-[var(--quad-b)] text-[var(--quad-b)]',
                        C: 'bg-[var(--quad-c)]/20 border-[var(--quad-c)] text-[var(--quad-c)]',
                        D: 'bg-[var(--quad-d)]/20 border-[var(--quad-d)] text-[var(--quad-d)]',
                      };

                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "absolute left-2 right-2 rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md backdrop-blur-sm overflow-hidden flex flex-col",
                            quadColors[task.quadrant],
                            task.completed ? "opacity-50" : "hover:scale-[1.02] z-20"
                          )}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskModal(task);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <span className={cn("font-medium text-sm truncate pr-2", task.completed && "line-through")}>
                              {task.title}
                            </span>
                            <div onClick={(e) => handleToggleTask(task, e)}>
                              {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </div>
                          </div>
                          <div className="text-xs mt-1 opacity-80 flex items-center justify-between">
                            <span>{task.startTime} - {task.endTime}</span>
                            {task.repeat && task.repeat !== 'none' && (
                              <Repeat size={12} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderQuadrants = () => {
    const todayTasks = displayTasks.filter(t => t.date === format(currentDate, 'yyyy-MM-dd'));
    const quads: { id: Quadrant; label: string; color: string }[] = [
      { id: 'A', label: '重要且紧急', color: 'border-[var(--quad-a)]' },
      { id: 'B', label: '重要不紧急', color: 'border-[var(--quad-b)]' },
      { id: 'C', label: '紧急不重要', color: 'border-[var(--quad-c)]' },
      { id: 'D', label: '不重要不紧急', color: 'border-[var(--quad-d)]' },
    ];

    return (
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6 h-full">
        {quads.map(q => (
          <div key={q.id} className={cn("bg-surface rounded-3xl p-6 border-t-4 shadow-sm flex flex-col", q.color)}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{q.label}</h3>
              <span className="text-sm font-medium text-text-muted bg-bg px-2 py-1 rounded-lg">
                象限 {q.id}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {todayTasks.filter(t => t.quadrant === q.id).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => openTaskModal(task)}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      className={cn("text-text-muted hover:text-primary transition-colors", task.completed && "text-primary")}
                      onClick={(e) => handleToggleTask(task, e)}
                    >
                      {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <span className={cn("font-medium", task.completed && "line-through text-text-muted")}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.repeat && task.repeat !== 'none' && (
                      <Repeat size={14} className="text-text-muted opacity-50" />
                    )}
                    {task.startTime && (
                      <span className="text-xs text-text-muted font-mono bg-surface px-2 py-1 rounded-md border border-border group-hover:border-primary/30 transition-colors">
                        {task.startTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => openTaskModal(undefined, currentDate)}
                className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span className="font-medium text-sm">添加任务</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const nextPeriod = () => {
    if (daysView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, daysView as number));
    }
  };

  const prevPeriod = () => {
    if (daysView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, daysView as number));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">你好，时光旅人</h1>
          <p className="text-text-muted">今天是 {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}，专注当下。</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface p-1 rounded-full border border-border shadow-sm">
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                viewMode === 'timeline' ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text"
              )}
            >
              <CalendarIcon size={18} />
              日期流
            </button>
            <button
              onClick={() => setViewMode('quadrant')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                viewMode === 'quadrant' ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text"
              )}
            >
              <Grid size={18} />
              四象限
            </button>
          </div>
          <button 
            onClick={() => openTaskModal()}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-all hover:scale-105"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {viewMode === 'timeline' && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 bg-bg p-1 rounded-full border border-border">
            {['month', 1, 2, 3, 7].map(d => (
              <button
                key={d}
                onClick={() => setDaysView(d as any)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  daysView === d ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
                )}
              >
                {d === 'month' ? '月' : `${d}日`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-surface px-4 py-2 rounded-full border border-border">
            <button onClick={prevPeriod} className="text-text-muted hover:text-primary transition-colors p-1">
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-lg min-w-[120px] text-center">
              {format(currentDate, 'yyyy年 MM月', { locale: zhCN })}
            </span>
            <button onClick={nextPeriod} className="text-text-muted hover:text-primary transition-colors p-1">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {viewMode === 'timeline' ? renderTimeline() : renderQuadrants()}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask}
        selectedDate={selectedDate}
      />
    </div>
  );
};
