'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Flame, Trophy, Plus, Check, X, Calendar, 
  TrendingUp, Zap, Dumbbell, Apple, Droplets, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { UserGoal, GoalType, GoalStatus } from '@/lib/types';

interface GoalsViewProps {
  userId: string;
  isDemo?: boolean;
}

const goalIcons: Record<GoalType, React.ReactNode> = {
  weight: <TrendingUp className="w-5 h-5" />,
  nutrition: <Apple className="w-5 h-5" />,
  fitness: <Dumbbell className="w-5 h-5" />,
  habit: <Zap className="w-5 h-5" />,
};

const goalColors: Record<GoalType, string> = {
  weight: 'from-purple-500 to-indigo-600',
  nutrition: 'from-emerald-500 to-teal-600',
  fitness: 'from-orange-500 to-red-600',
  habit: 'from-amber-500 to-yellow-600',
};

export function GoalsView({ userId, isDemo = false }: GoalsViewProps) {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [streakDays, setStreakDays] = useState(7);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    goal_type: 'fitness' as GoalType,
    target_value: 0,
    unit: '',
  });

  useEffect(() => {
    if (isDemo) {
      setGoals([
        {
          id: '1',
          user_id: userId,
          title: 'Lose 5kg',
          description: 'Reach target weight',
          goal_type: 'weight',
          target_value: 5,
          current_value: 2.3,
          unit: 'kg',
          start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: userId,
          title: 'Drink 8 glasses of water',
          goal_type: 'habit',
          target_value: 8,
          current_value: 6,
          unit: 'glasses',
          start_date: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          user_id: userId,
          title: 'Exercise 150 min/week',
          goal_type: 'fitness',
          target_value: 150,
          current_value: 95,
          unit: 'min',
          start_date: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          user_id: userId,
          title: 'Eat 100g protein daily',
          goal_type: 'nutrition',
          target_value: 100,
          current_value: 100,
          unit: 'g',
          start_date: new Date().toISOString(),
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setStreakDays(7);
    } else {
      fetchGoals();
    }
  }, [userId, isDemo]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setGoals(data);
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    const goalData: Partial<UserGoal> = {
      user_id: userId,
      title: newGoal.title,
      goal_type: newGoal.goal_type,
      target_value: newGoal.target_value || undefined,
      current_value: 0,
      unit: newGoal.unit || undefined,
      start_date: new Date().toISOString(),
      status: 'active',
    };

    if (isDemo) {
      setGoals([
        {
          ...goalData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserGoal,
        ...goals,
      ]);
    } else {
      const { error } = await supabase.from('user_goals').insert(goalData);
      if (!error) fetchGoals();
    }

    setNewGoal({ title: '', goal_type: 'fitness', target_value: 0, unit: '' });
    setShowAddGoal(false);
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const status = newValue >= (g.target_value || 0) ? 'completed' : 'active';
        return { ...g, current_value: newValue, status: status as GoalStatus };
      }
      return g;
    });
    setGoals(updatedGoals);

    if (!isDemo) {
      await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue, 
          status: newValue >= (goal.target_value || 0) ? 'completed' : 'active',
          updated_at: new Date().toISOString() 
        })
        .eq('id', goalId);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    if (!isDemo) {
      await supabase.from('user_goals').delete().eq('id', goalId);
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Your Goals</h1>
        <p className="text-white/50 text-sm">Track progress & build streaks</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Current Streak</p>
              <p className="text-3xl font-bold text-white">{streakDays} <span className="text-lg text-white/60">days</span></p>
            </div>
          </div>
          <div className="text-right">
            <Trophy className="w-8 h-8 text-amber-400 mb-1" />
            <p className="text-xs text-white/50">Best: 14 days</p>
          </div>
        </div>

        <div className="flex justify-between gap-1">
          {weekDays.map((day, i) => {
            const isCompleted = i <= adjustedToday && i >= adjustedToday - (streakDays % 7);
            const isToday = i === adjustedToday;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs text-white/40">{day}</span>
                <div 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30' 
                      : 'bg-white/5 border border-white/10'
                  } ${isToday ? 'ring-2 ring-white/30' : ''}`}
                >
                  {isCompleted && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Goals</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddGoal(true)}
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Goal
        </Button>
      </div>

      <div className="space-y-3">
        {activeGoals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-white/40"
          >
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active goals yet</p>
            <p className="text-sm">Add your first goal to get started!</p>
          </motion.div>
        ) : (
          activeGoals.map((goal, index) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              index={index}
              onUpdateProgress={handleUpdateProgress}
              onDelete={handleDeleteGoal}
            />
          ))
        )}
      </div>

      {completedGoals.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mt-6">Completed</h2>
          <div className="space-y-3">
            {completedGoals.map((goal, index) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                index={index}
                onUpdateProgress={handleUpdateProgress}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {showAddGoal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowAddGoal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 z-[100] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">New Goal</h3>
                <button 
                  onClick={() => setShowAddGoal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Goal Title</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Run 5km every week"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Goal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['weight', 'nutrition', 'fitness', 'habit'] as GoalType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewGoal({ ...newGoal, goal_type: type })}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          newGoal.goal_type === type
                            ? `bg-gradient-to-br ${goalColors[type]} border-transparent`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {goalIcons[type]}
                        <span className="text-xs text-white capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Target Value</label>
                    <Input
                      type="number"
                      value={newGoal.target_value || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                      placeholder="e.g., 10"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Unit</label>
                    <Input
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="e.g., kg, km, min"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddGoal}
                  className="w-full bg-primary text-black font-semibold py-6 rounded-xl"
                  disabled={!newGoal.title.trim()}
                >
                  Create Goal
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({ 
  goal, 
  index, 
  onUpdateProgress, 
  onDelete 
}: { 
  goal: UserGoal; 
  index: number;
  onUpdateProgress: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  const progress = goal.target_value ? (goal.current_value / goal.target_value) * 100 : 0;
  const isCompleted = goal.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${goalColors[goal.goal_type]} flex items-center justify-center`}>
            {goalIcons[goal.goal_type]}
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.title}</h3>
            {goal.target_value && (
              <p className="text-sm text-white/50">
                {goal.current_value} / {goal.target_value} {goal.unit}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => onDelete(goal.id)}
          className="text-white/30 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {goal.target_value && (
        <div className="space-y-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${goalColors[goal.goal_type]} rounded-full`}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{Math.round(progress)}% complete</span>
            {!isCompleted && (
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                  className="w-6 h-6 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateProgress(goal.id, goal.current_value + 1)}
                  className="w-6 h-6 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-2 text-emerald-400 mt-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Goal completed!</span>
        </div>
      )}
    </motion.div>
  );
}
