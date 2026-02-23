import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, Circle, Plus, Filter, Edit2 } from 'lucide-react';
import { useAppContext, Goal } from '../context/AppContext';
import { cn } from '../utils/cn';
import { GoalModal } from '../components/GoalModal';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const filteredGoals = goals.filter(g => hideCompleted ? g.status === 'active' : true);
  
  const activeGoals = filteredGoals.filter(g => g.status === 'active');
  const completedGoals = filteredGoals.filter(g => g.status === 'completed');

  const handleOpenModal = (goal?: Goal) => {
    setSelectedGoal(goal || null);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'completedTasks' | 'status'> | Goal) => {
    if ('id' in goalData) {
      updateGoal(goalData.id, goalData);
    } else {
      addGoal(goalData);
    }
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };

  const renderGoalCard = (goal: typeof goals[0]) => {
    const progress = (goal.completedTasks / goal.totalTasks) * 100;
    const goalColor = goal.color || 'var(--primary)';
    
    return (
      <motion.div
        key={goal.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "bg-surface p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md relative group",
          goal.status === 'completed' ? "border-green-500/30 bg-green-50/10" : "border-border"
        )}
      >
        <button
          onClick={() => handleOpenModal(goal)}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <Edit2 size={16} />
        </button>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center",
                goal.status === 'completed' ? "bg-green-500 text-white" : ""
              )}
              style={goal.status !== 'completed' ? { backgroundColor: `${goalColor}20`, color: goalColor } : {}}
            >
              <Target size={20} />
            </div>
            <div>
              <h3 className={cn("font-bold text-lg pr-8", goal.status === 'completed' && "text-text-muted line-through")}>
                {goal.title}
              </h3>
              <p className="text-sm text-text-muted">
                {goal.completedTasks} / {goal.totalTasks} {goal.unit || '次'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-2 bg-bg rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
              goal.status === 'completed' ? "bg-green-500" : ""
            )}
            style={goal.status !== 'completed' ? { backgroundColor: goalColor } : {}}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs font-mono text-text-muted">
          {Math.round(progress)}%
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">长期目标</h1>
          <p className="text-sm md:text-base text-text-muted">专注当下，成就未来。</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl border transition-colors text-sm md:text-base",
              hideCompleted ? "bg-primary text-white border-primary" : "bg-surface text-text-muted border-border hover:border-primary"
            )}
          >
            <Filter size={16} className="md:w-[18px] md:h-[18px]" />
            隐藏已完成
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-opacity-90 transition-all hover:scale-105 text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            新建目标
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-6 md:space-y-8 pb-4 md:pb-0">
        {activeGoals.length > 0 && (
          <section>
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              进行中
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {activeGoals.map(renderGoalCard)}
            </div>
          </section>
        )}

        {completedGoals.length > 0 && (
          <section className="opacity-70">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 text-text-muted">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              已完成
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {completedGoals.map(renderGoalCard)}
            </div>
          </section>
        )}

        {filteredGoals.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-text-muted">
            <Target size={40} className="mb-4 opacity-20 md:w-12 md:h-12" />
            <p className="text-sm md:text-base">暂无目标，点击右上角新建一个吧。</p>
          </div>
        )}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        initialGoal={selectedGoal}
      />
    </div>
  );
};
