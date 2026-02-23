import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Repeat, Target } from 'lucide-react';
import { Task, Quadrant, RepeatType, useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
  selectedDate?: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  selectedDate,
}) => {
  const { goals } = useAppContext();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [quadrant, setQuadrant] = useState<Quadrant>('A');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [repeatCustomDays, setRepeatCustomDays] = useState<number[]>([]);
  const [goalId, setGoalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDate(initialTask.date);
      setStartTime(initialTask.startTime || '09:00');
      setEndTime(initialTask.endTime || '10:00');
      setQuadrant(initialTask.quadrant);
      setRepeat(initialTask.repeat || 'none');
      setRepeatCustomDays(initialTask.repeatCustomDays || []);
      setGoalId(initialTask.goalId);
    } else {
      setTitle('');
      setDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setQuadrant('A');
      setRepeat('none');
      setRepeatCustomDays([]);
      setGoalId(undefined);
    }
  }, [initialTask, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    // Calculate duration
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end.getTime() - start.getTime()) / 60000;
    if (duration < 0) duration += 24 * 60; // handle overnight

    const taskData = {
      title,
      date,
      startTime,
      endTime,
      quadrant,
      completed: initialTask ? initialTask.completed : false,
      duration,
      repeat,
      repeatCustomDays: repeat === 'custom' ? repeatCustomDays : undefined,
      goalId,
      ...(initialTask ? { id: initialTask.id, parentId: initialTask.parentId } : {})
    };

    onSave(taskData as any);
    onClose();
  };

  const toggleCustomDay = (day: number) => {
    setRepeatCustomDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const quads: { id: Quadrant; label: string; color: string; bg: string }[] = [
    { id: 'A', label: '重要且紧急', color: 'text-[var(--quad-a)]', bg: 'bg-[var(--quad-a)]/20 border-[var(--quad-a)]' },
    { id: 'B', label: '重要不紧急', color: 'text-[var(--quad-b)]', bg: 'bg-[var(--quad-b)]/20 border-[var(--quad-b)]' },
    { id: 'C', label: '紧急不重要', color: 'text-[var(--quad-c)]', bg: 'bg-[var(--quad-c)]/20 border-[var(--quad-c)]' },
    { id: 'D', label: '不重要不紧急', color: 'text-[var(--quad-d)]', bg: 'bg-[var(--quad-d)]/20 border-[var(--quad-d)]' },
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-surface w-full max-w-md rounded-3xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold">{initialTask ? '编辑任务' : '新建任务'}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-2 -mr-2">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">任务名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                placeholder="输入任务名称..."
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">开始</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-2 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">结束</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-2 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">四象限分类</label>
              <div className="grid grid-cols-2 gap-3">
                {quads.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setQuadrant(q.id)}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                      quadrant === q.id ? q.bg : "bg-bg border-border text-text-muted hover:border-primary/50"
                    )}
                  >
                    <div className={cn("mb-1", quadrant === q.id ? q.color : "")}>象限 {q.id}</div>
                    <div className="text-xs opacity-80">{q.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Repeat size={16} />
                重复设置
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="none">不重复</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="custom">自定义 (按星期)</option>
              </select>

              {repeat === 'custom' && (
                <div className="mt-3 flex justify-between gap-1">
                  {weekDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleCustomDay(index)}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors",
                        repeatCustomDays.includes(index)
                          ? "bg-primary text-white"
                          : "bg-bg border border-border text-text-muted hover:border-primary"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Target size={16} />
                关联目标 (可选)
              </label>
              <select
                value={goalId || ''}
                onChange={(e) => setGoalId(e.target.value || undefined)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="">无关联目标</option>
                {goals.filter(g => g.status === 'active').map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-border bg-bg flex-shrink-0">
            {initialTask && onDelete ? (
              <button
                onClick={() => {
                  onDelete(initialTask.id);
                  onClose();
                }}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={20} />
                <span className="text-sm font-medium">删除</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-medium text-text-muted hover:bg-surface transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
