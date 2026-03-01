import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Grid, Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useAppContext, Task, Quadrant } from '../context/AppContext';
import { cn } from '../utils/cn';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getDay, getDate } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TaskModal } from '../components/TaskModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Xarrow, { Xwrapper } from 'react-xarrows';

const SortableItem = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string, key?: React.Key }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div id={`task-${id}`} ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
};

export const Home: React.FC = () => {
  const { tasks, updateTask, addTask, deleteTask, userStats } = useAppContext();
  const [viewMode, setViewMode] = useState<'timeline' | 'quadrant'>('timeline');
  const [daysView, setDaysView] = useState<'month' | 1 | 2 | 3 | 7>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { reorderTasks } = useAppContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      // Extract original task IDs if they are virtual (e.g., "123-2023-10-01")
      const getOriginalId = (id: string) => {
        const task = displayTasks.find(t => t.id === id);
        return task?.parentId || task?.id || id;
      };
      
      const originalActiveId = getOriginalId(activeId);
      const originalOverId = getOriginalId(overId);

      if (originalActiveId !== originalOverId) {
        reorderTasks(originalActiveId, originalOverId);
      }
    }
  };

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
              "min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-border/50 transition-colors hover:bg-surface/50 cursor-pointer relative group",
              !isSameMonth(day, monthStart) ? "bg-bg/50 text-text-muted/50" : "bg-surface",
              isSameDay(day, new Date()) ? "bg-primary/5" : ""
            )}
            key={day.toISOString()}
            onClick={() => openTaskModal(undefined, cloneDay)}
          >
            <div className="flex justify-between items-start mb-1 md:mb-2">
              <span className={cn(
                "w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-medium",
                isSameDay(day, new Date()) ? "bg-primary text-white" : "text-text-muted group-hover:text-primary transition-colors"
              )}>
                {formattedDate}
              </span>
              <button className="md:opacity-0 md:group-hover:opacity-100 text-primary p-1 md:p-2 hover:bg-primary/10 rounded-md transition-all">
                <Plus size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[50px] md:max-h-[80px] scrollbar-hide">
              <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {dayTasks.map(task => {
                  const quadColors = {
                    A: 'bg-[var(--quad-a)]/20 text-[var(--quad-a)] border-[var(--quad-a)]/30',
                    B: 'bg-[var(--quad-b)]/20 text-[var(--quad-b)] border-[var(--quad-b)]/30',
                    C: 'bg-[var(--quad-c)]/20 text-[var(--quad-c)] border-[var(--quad-c)]/30',
                    D: 'bg-[var(--quad-d)]/20 text-[var(--quad-d)] border-[var(--quad-d)]/30',
                  };
                  return (
                    <SortableItem key={task.id} id={task.id}>
                      <div
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
                    </SortableItem>
                  );
                })}
              </SortableContext>
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
    
    const periods = [
      { id: 'morning', label: '上午', time: '00:00-12:00', start: 0, end: 12 },
      { id: 'afternoon', label: '下午', time: '12:00-18:00', start: 12, end: 18 },
      { id: 'evening', label: '晚上', time: '18:00-24:00', start: 18, end: 24 }
    ];

    return (
      <Xwrapper>
        <div className="flex-1 overflow-y-auto bg-surface rounded-3xl border border-border shadow-sm p-4 md:p-6 relative" id="timeline-container">
          <div className="flex flex-col h-full min-w-0">
            {/* Days Header */}
            <div className="flex divide-x divide-border/50 border-b border-border/50 pb-2 mb-4 sticky top-0 bg-surface z-20">
              <div className="w-12 md:w-16 flex-shrink-0" /> {/* Empty corner */}
              {days.map(day => (
                <div key={day.toISOString()} className="flex-1 min-w-[100px] text-center px-1">
                  <div className="text-xs md:text-sm text-text-muted">{format(day, 'EEEE', { locale: zhCN })}</div>
                  <div className={cn(
                    "text-lg md:text-xl font-bold mt-1 w-7 h-7 md:w-8 md:h-8 mx-auto flex items-center justify-center rounded-full",
                    format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-primary text-white" : ""
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Periods */}
            <div className="flex-1 flex flex-col divide-y divide-border/50 overflow-y-auto scrollbar-hide">
              {periods.map(period => (
                <div key={period.id} className="flex flex-1 min-h-[150px]">
                  {/* Period Label */}
                  <div className="w-12 md:w-16 flex-shrink-0 flex items-center justify-center border-r border-border/50 pr-2 md:pr-4">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="text-sm md:text-base font-medium text-text-muted tracking-widest"
                        style={{ writingMode: 'vertical-rl' }}
                      >
                        {period.label}
                      </div>
                      <div 
                        className="text-[10px] md:text-xs text-text-muted/60 font-mono tracking-wider"
                        style={{ writingMode: 'vertical-rl' }}
                      >
                        {period.time}
                      </div>
                    </div>
                  </div>

                  {/* Days Columns for this period */}
                  <div className="flex-1 flex divide-x divide-border/50">
                    {days.map(day => {
                      const dayTasks = displayTasks.filter(t => {
                        if (t.date !== format(day, 'yyyy-MM-dd')) return false;
                        const hour = parseInt(t.startTime?.split(':')[0] || '0');
                        return hour >= period.start && hour < period.end;
                      });

                      return (
                        <div 
                          key={day.toISOString()} 
                          className="flex-1 min-w-[100px] p-2 flex flex-col gap-2 hover:bg-bg/30 transition-colors cursor-pointer"
                          onClick={() => {
                            openTaskModal(undefined, day);
                          }}
                        >
                          <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            {dayTasks.map(task => {
                              const quadColors = {
                                A: 'bg-[var(--quad-a)]/20 border-[var(--quad-a)] text-[var(--quad-a)]',
                                B: 'bg-[var(--quad-b)]/20 border-[var(--quad-b)] text-[var(--quad-b)]',
                                C: 'bg-[var(--quad-c)]/20 border-[var(--quad-c)] text-[var(--quad-c)]',
                                D: 'bg-[var(--quad-d)]/20 border-[var(--quad-d)] text-[var(--quad-d)]',
                              };

                              return (
                                <SortableItem key={task.id} id={task.id}>
                                  <div
                                    className={cn(
                                      "rounded-xl border p-2 md:p-3 cursor-pointer transition-all hover:shadow-md flex flex-col gap-1",
                                      quadColors[task.quadrant],
                                      task.completed ? "opacity-50" : "hover:scale-[1.02]"
                                    )}
                                    style={{ minHeight: `${Math.max(60, task.duration || 60)}px` }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openTaskModal(task);
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <span className={cn("font-medium text-xs md:text-sm line-clamp-2", task.completed && "line-through")}>
                                        {task.title}
                                      </span>
                                      <div onClick={(e) => handleToggleTask(task, e)} className="flex-shrink-0">
                                        {task.completed ? <CheckCircle2 size={14} className="md:w-4 md:h-4" /> : <Circle size={14} className="md:w-4 md:h-4" />}
                                      </div>
                                    </div>
                                    <div className="text-[10px] md:text-xs opacity-80 flex items-center justify-between mt-auto">
                                      <span>{task.startTime} - {task.endTime || ''}</span>
                                      {task.repeat && task.repeat !== 'none' && (
                                        <Repeat size={10} className="md:w-3 md:h-3" />
                                      )}
                                    </div>
                                  </div>
                                </SortableItem>
                              );
                            })}
                          </SortableContext>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Render Dependency Arrows */}
          {displayTasks.map(task => {
            if (!task.dependencies || task.dependencies.length === 0) return null;
            
            return task.dependencies.map(depId => {
              // Find the dependency task in displayTasks
              const depTasks = displayTasks.filter(t => t.id === depId || t.parentId === depId);
              if (depTasks.length === 0) return null;
              
              // Sort by date descending
              depTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              // Find the closest one before or on the same day
              let targetDep = depTasks.find(t => new Date(t.date) <= new Date(task.date));
              if (!targetDep) targetDep = depTasks[0]; // fallback
              
              return (
                <Xarrow
                  key={`${targetDep.id}-${task.id}`}
                  start={`task-${targetDep.id}`}
                  end={`task-${task.id}`}
                  color="var(--primary)"
                  strokeWidth={2}
                  dashness
                  path="smooth"
                  showHead={true}
                  headSize={4}
                  zIndex={10}
                />
              );
            });
          })}
        </div>
      </Xwrapper>
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
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 grid-rows-none md:grid-rows-2 gap-4 md:gap-6 h-full overflow-y-auto pb-4 md:pb-0">
        {quads.map(q => (
          <div key={q.id} className={cn("bg-surface rounded-3xl p-4 md:p-6 border-t-4 shadow-sm flex flex-col min-h-[300px]", q.color)}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base md:text-lg">{q.label}</h3>
              <span className="text-xs md:text-sm font-medium text-text-muted bg-bg px-2 py-1 rounded-lg">
                象限 {q.id}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-1 md:pr-2">
              <SortableContext items={todayTasks.filter(t => t.quadrant === q.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                {todayTasks.filter(t => t.quadrant === q.id).map(task => (
                  <SortableItem key={task.id} id={task.id}>
                    <div
                      className="flex items-center justify-between p-3 md:p-4 bg-bg rounded-2xl border border-border hover:border-primary transition-colors cursor-pointer group"
                      onClick={() => openTaskModal(task)}
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <button 
                          className={cn("text-text-muted hover:text-primary transition-colors flex-shrink-0", task.completed && "text-primary")}
                          onClick={(e) => handleToggleTask(task, e)}
                        >
                          {task.completed ? <CheckCircle2 size={18} className="md:w-5 md:h-5" /> : <Circle size={18} className="md:w-5 md:h-5" />}
                        </button>
                        <span className={cn("font-medium text-sm md:text-base truncate", task.completed && "line-through text-text-muted")}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        {task.repeat && task.repeat !== 'none' && (
                          <Repeat size={12} className="md:w-[14px] md:h-[14px] text-text-muted opacity-50" />
                        )}
                        {task.startTime && (
                          <span className="text-[10px] md:text-xs text-text-muted font-mono bg-surface px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border border-border group-hover:border-primary/30 transition-colors">
                            {task.startTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
              <button 
                onClick={() => openTaskModal(undefined, currentDate)}
                className="w-full py-2 md:py-3 border-2 border-dashed border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="font-medium text-xs md:text-sm">添加任务</span>
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">你好，{userStats.profile.name}</h1>
          <p className="text-sm md:text-base text-text-muted">今天是 {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}，专注当下。</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-surface p-1 rounded-full border border-border shadow-sm">
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all",
                viewMode === 'timeline' ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text"
              )}
            >
              <CalendarIcon size={16} className="md:w-[18px] md:h-[18px]" />
              日期流
            </button>
            <button
              onClick={() => setViewMode('quadrant')}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all",
                viewMode === 'quadrant' ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text"
              )}
            >
              <Grid size={16} className="md:w-[18px] md:h-[18px]" />
              四象限
            </button>
          </div>
          <button 
            onClick={() => openTaskModal()}
            className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-all hover:scale-105 flex-shrink-0"
          >
            <Plus size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {viewMode === 'timeline' && (
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4 md:mb-6">
          <div className="flex gap-1 md:gap-2 bg-bg p-1 rounded-full border border-border overflow-x-auto scrollbar-hide">
            {['month', 1, 2, 3, 7].map(d => (
              <button
                key={d}
                onClick={() => setDaysView(d as any)}
                className={cn(
                  "px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                  daysView === d ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
                )}
              >
                {d === 'month' ? '月' : `${d}日`}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between md:justify-center gap-2 md:gap-4 bg-surface px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border">
            <button onClick={prevPeriod} className="text-text-muted hover:text-primary transition-colors p-2">
              <ChevronLeft size={20} className="md:w-5 md:h-5" />
            </button>
            <span className="font-medium text-sm md:text-lg min-w-[100px] md:min-w-[120px] text-center">
              {format(currentDate, 'yyyy年 MM月', { locale: zhCN })}
            </span>
            <button onClick={nextPeriod} className="text-text-muted hover:text-primary transition-colors p-2">
              <ChevronRight size={20} className="md:w-5 md:h-5" />
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
    </DndContext>
  );
};
