'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Footprints, Flame, Timer, TrendingUp } from 'lucide-react';
import { Meal, DailyStats } from '@/lib/types';

interface ActivityHistoryViewProps {
  meals: Meal[];
  stats: DailyStats | null;
}

export function ActivityHistoryView({ meals, stats }: ActivityHistoryViewProps) {
  const activities = meals.map(meal => ({
    name: `${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}`,
    date: new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    kcal: meal.total_calories,
    type: meal.meal_type,
    icon: meal.meal_type === 'breakfast' ? '🥣' : meal.meal_type === 'lunch' ? '🥗' : meal.meal_type === 'dinner' ? '🍽️' : '🍎'
  }));

  // Mock data for the graph
  const points = [40, 60, 45, 90, 55, 70, 65];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-2 pt-4">
        <h2 className="text-2xl font-bold">Activity History</h2>
        <span className="text-2xl">👟</span>
      </div>

      <div className="glass-card rounded-[32px] p-6 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <p className="text-sm font-bold text-primary mb-1">12k</p>
            <div className="h-40 flex items-end gap-2 px-4">
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${p}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="w-8 bg-gradient-to-t from-primary/20 via-primary/50 to-primary rounded-full relative group"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                    {Math.round(p * 150)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <div>
            <p className="text-sm font-bold">Weekly Steps</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary flex items-center gap-1">
              {(stats?.steps || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">today</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center justify-between p-4 rounded-[24px] glass-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-xl">
                {activity.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm">{activity.name}</h4>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{activity.kcal} <span className="text-[10px] text-muted-foreground font-medium uppercase">kcal</span></p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
