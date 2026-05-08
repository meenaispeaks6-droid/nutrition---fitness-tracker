'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Target, Plus, Trophy, Dumbbell, Apple, Scale, 
  Calendar, CheckCircle2, Pause, Play, Trash2, 
  Edit3, X, TrendingUp, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile, UserGoal, GoalType, GoalStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalsProps {
  profile: Profile;
  isDemo?: boolean;
}

const goalTypeConfig: Record<GoalType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  weight: { icon: <Scale className="w-5 h-5" />, color: 'text-violet-500', bgColor: 'from-violet-500/20 to-violet-500/5' },
  nutrition: { icon: <Apple className="w-5 h-5" />, color: 'text-emerald-500', bgColor: 'from-emerald-500/20 to-emerald-500/5' },
  fitness: { icon: <Dumbbell className="w-5 h-5" />, color: 'text-orange-500', bgColor: 'from-orange-500/20 to-orange-500/5' },
  habit: { icon: <Trophy className="w-5 h-5" />, color: 'text-amber-500', bgColor: 'from-amber-500/20 to-amber-500/5' },
};

const demoGoals: UserGoal[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    title: 'Lose 5kg',
    description: 'Reach my target weight by summer',
    goal_type: 'weight',
    target_value: 70,
    current_value: 75,
    unit: 'kg',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    title: 'Eat 150g protein daily',
    description: 'Hit protein target every day this week',
    goal_type: 'nutrition',
    target_value: 7,
    current_value: 4,
    unit: 'days',
    start_date: new Date().toISOString(),
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    title: 'Run 20km per week',
    description: 'Build up cardio endurance',
    goal_type: 'fitness',
    target_value: 20,
    current_value: 12,
    unit: 'km',
    start_date: new Date().toISOString(),
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function Goals({ profile, isDemo = false }: GoalsProps) {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'fitness' as GoalType,
    target_value: '',
    current_value: '',
    unit: '',
    target_date: '',
  });

  useEffect(() => {
    if (isDemo) {
      setGoals(demoGoals);
      setLoading(false);
    } else {
      fetchGoals();
    }
  }, [isDemo]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setGoals(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      user_id: profile.id,
      title: formData.title,
      description: formData.description || null,
      goal_type: formData.goal_type,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
      unit: formData.unit || null,
      target_date: formData.target_date || null,
    };

      if (isDemo) {
        if (editingGoal) {
          setGoals(prev => prev.map(g => {
            if (g.id === editingGoal.id) {
              return {
                ...g,
                ...goalData,
                description: goalData.description || undefined,
                target_value: goalData.target_value || undefined,
                unit: goalData.unit || undefined,
                target_date: goalData.target_date || undefined,
                updated_at: new Date().toISOString()
              } as UserGoal;
            }
            return g;
          }));
        } else {
        const newGoal: UserGoal = {
          id: `demo-${Date.now()}`,
          user_id: profile.id,
          title: formData.title,
          description: formData.description || undefined,
          goal_type: formData.goal_type,
          target_value: formData.target_value ? parseFloat(formData.target_value) : undefined,
          current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
          unit: formData.unit || undefined,
          start_date: new Date().toISOString(),
          target_date: formData.target_date || undefined,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setGoals(prev => [newGoal, ...prev]);
      }
    } else {
      if (editingGoal) {
        await supabase.from('goals').update(goalData).eq('id', editingGoal.id);
      } else {
        await supabase.from('goals').insert(goalData);
      }
      fetchGoals();
    }

    resetForm();
  };

  const updateGoalStatus = async (goal: UserGoal, newStatus: GoalStatus) => {
    if (isDemo) {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: newStatus } : g));
    } else {
      await supabase.from('goals').update({ status: newStatus }).eq('id', goal.id);
      fetchGoals();
    }
  };

  const updateProgress = async (goal: UserGoal, newValue: number) => {
    if (isDemo) {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, current_value: newValue } : g));
    } else {
      await supabase.from('goals').update({ current_value: newValue }).eq('id', goal.id);
      fetchGoals();
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (isDemo) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } else {
      await supabase.from('goals').delete().eq('id', goalId);
      fetchGoals();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      goal_type: 'fitness',
      target_value: '',
      current_value: '',
      unit: '',
      target_date: '',
    });
  };

  const openEditForm = (goal: UserGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_value: goal.target_value?.toString() || '',
      current_value: goal.current_value?.toString() || '',
      unit: goal.unit || '',
      target_date: goal.target_date?.split('T')[0] || '',
    });
    setShowForm(true);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const pausedGoals = goals.filter(g => g.status === 'paused');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Target className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Goals</h2>
            <p className="text-xs text-muted-foreground">{activeGoals.length} active</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => setShowForm(true)}
            className="rounded-2xl gradient-primary text-white border-0 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </motion.div>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 && pausedGoals.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 glass-card rounded-[28px]"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Goals Yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Set your first goal to start tracking your progress
          </p>
          <Button onClick={() => setShowForm(true)} className="rounded-2xl gradient-primary text-white border-0">
            Create Your First Goal
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
              </div>
              <AnimatePresence mode="popLayout">
                {activeGoals.map((goal, idx) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    onEdit={() => openEditForm(goal)}
                    onDelete={() => deleteGoal(goal.id)}
                    onStatusChange={(status) => updateGoalStatus(goal, status)}
                    onProgressUpdate={(val) => updateProgress(goal, val)}
                  />
                ))}
              </AnimatePresence>
            </section>
          )}

          {pausedGoals.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Pause className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Paused</span>
              </div>
              <AnimatePresence mode="popLayout">
                {pausedGoals.map((goal, idx) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    onEdit={() => openEditForm(goal)}
                    onDelete={() => deleteGoal(goal.id)}
                    onStatusChange={(status) => updateGoalStatus(goal, status)}
                    onProgressUpdate={(val) => updateProgress(goal, val)}
                  />
                ))}
              </AnimatePresence>
            </section>
          )}

          {completedGoals.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
              </div>
              <AnimatePresence mode="popLayout">
                {completedGoals.map((goal, idx) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    onEdit={() => openEditForm(goal)}
                    onDelete={() => deleteGoal(goal.id)}
                    onStatusChange={(status) => updateGoalStatus(goal, status)}
                    onProgressUpdate={(val) => updateProgress(goal, val)}
                  />
                ))}
              </AnimatePresence>
            </section>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-2xl overflow-y-auto"
          >
            <div className="max-w-lg mx-auto p-5 pt-8 min-h-screen">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {editingGoal ? 'Edit Goal' : 'New Goal'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {editingGoal ? 'Update your goal details' : 'Set a new target to achieve'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="glass-subtle rounded-2xl w-11 h-11" 
                  onClick={resetForm}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Goal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(goalTypeConfig) as GoalType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, goal_type: type }))}
                        className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                          formData.goal_type === type
                            ? 'glass-card ring-2 ring-primary'
                            : 'glass-subtle hover:bg-secondary/50'
                        }`}
                      >
                        <span className={goalTypeConfig[type].color}>
                          {goalTypeConfig[type].icon}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider capitalize">
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Lose 5kg, Run a marathon"
                    className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add more details about your goal..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Target</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.target_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Current</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.current_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="kg, km, days"
                      className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Target Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl glass-subtle border-0 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 rounded-2xl h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-2xl h-12 gradient-primary text-white border-0"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GoalCardProps {
  goal: UserGoal;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: GoalStatus) => void;
  onProgressUpdate: (value: number) => void;
}

function GoalCard({ goal, index, onEdit, onDelete, onStatusChange, onProgressUpdate }: GoalCardProps) {
  const [showActions, setShowActions] = useState(false);
  const config = goalTypeConfig[goal.goal_type];
  
  const progress = goal.target_value 
    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
    : 0;

  const daysLeft = goal.target_date 
    ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card rounded-[24px] p-5 bg-gradient-to-br ${config.bgColor} relative overflow-hidden`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base truncate">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {goal.target_value && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold">
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    goal.status === 'completed' 
                      ? 'bg-emerald-500' 
                      : goal.status === 'paused'
                      ? 'bg-gray-400'
                      : 'bg-gradient-to-r from-primary to-emerald-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            {daysLeft !== null && goal.status === 'active' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-secondary/50">
                {daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
              </span>
            )}
            {goal.status === 'completed' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-600">
                Completed
              </span>
            )}
            {goal.status === 'paused' && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-gray-500/20 text-gray-500">
                Paused
              </span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/50"
          >
            {goal.target_value && goal.status === 'active' && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Update Progress</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    defaultValue={goal.current_value}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val !== goal.current_value) {
                        onProgressUpdate(val);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl glass-subtle border-0 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <span className="px-3 py-2 text-sm text-muted-foreground">{goal.unit}</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="rounded-xl gap-1.5 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </Button>
              
              {goal.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange('completed')}
                    className="rounded-xl gap-1.5 text-xs text-emerald-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange('paused')}
                    className="rounded-xl gap-1.5 text-xs"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </Button>
                </>
              )}
              
              {goal.status === 'paused' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange('active')}
                  className="rounded-xl gap-1.5 text-xs text-primary"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </Button>
              )}
              
              {goal.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange('active')}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Reactivate
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="rounded-xl gap-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
