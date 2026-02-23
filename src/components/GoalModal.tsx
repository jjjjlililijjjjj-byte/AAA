import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Check } from 'lucide-react';
import { Goal } from '../context/AppContext';
import { cn } from '../utils/cn';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'completedTasks' | 'status'> | Goal) => void;
  onDelete?: (id: string) => void;
  initialGoal?: Goal | null;
}

const GOAL_COLORS = [
  { id: 'morandi-green', value: '#8F9B8C', label: '灰豆绿' },
  { id: 'morandi-blue', value: '#A4B5C4', label: '冷雾蓝' },
  { id: 'morandi-pink', value: '#B87B6A', label: '淡茱萸粉' },
  { id: 'morandi-brown', value: '#6B5B4D', label: '木质棕' },
  { id: 'morandi-yellow', value: '#D4C4A1', label: '藤黄' },
  { id: 'morandi-purple', value: '#9B8C9A', label: '丁香紫' },
  { id: 'morandi-gray', value: '#8C8C8C', label: '中性灰' },
  { id: 'morandi-teal', value: '#7A9A95', label: '苍绿' },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [totalTasks, setTotalTasks] = useState(5);
  const [unit, setUnit] = useState('次');
  const [color, setColor] = useState(GOAL_COLORS[0].value);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setTotalTasks(initialGoal.totalTasks);
      setUnit(initialGoal.unit || '次');
      setColor(initialGoal.color || GOAL_COLORS[0].value);
    } else {
      setTitle('');
      setTotalTasks(5);
      setUnit('次');
      setColor(GOAL_COLORS[0].value);
    }
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || totalTasks <= 0) return;

    const goalData = {
      title,
      totalTasks,
      unit,
      color,
      ...(initialGoal ? { id: initialGoal.id, completedTasks: initialGoal.completedTasks, status: initialGoal.status } : {})
    };

    onSave(goalData as any);
    onClose();
  };

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
          className="bg-surface w-full max-w-md rounded-3xl shadow-xl border border-border overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-xl font-bold">{initialGoal ? '编辑目标' : '新建目标'}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-2 -mr-2">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">目标名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                placeholder="例如：阅读 5 本书"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">目标数值</label>
                <input
                  type="number"
                  min="1"
                  value={totalTasks}
                  onChange={(e) => setTotalTasks(parseInt(e.target.value) || 1)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">单位</label>
                <input
                  type="text"
                  list="unit-options"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                  placeholder="例如：次、小时、天"
                />
                <datalist id="unit-options">
                  <option value="次" />
                  <option value="小时" />
                  <option value="天" />
                </datalist>
              </div>
            </div>
            
            {initialGoal && (
              <p className="text-xs text-text-muted -mt-4">
                已完成 {initialGoal.completedTasks} {unit}。如果减少总数值，目标可能会自动完成。
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-3">标签颜色</label>
              <div className="flex flex-wrap gap-3">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                      color === c.value ? "ring-2 ring-offset-2 ring-offset-surface ring-primary" : ""
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {color === c.value && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-border bg-bg">
            {initialGoal && onDelete ? (
              <button
                onClick={() => {
                  onDelete(initialGoal.id);
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
                disabled={!title.trim() || totalTasks <= 0}
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
