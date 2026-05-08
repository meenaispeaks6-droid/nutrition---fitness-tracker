'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Zap, Droplets, Footprints, TrendingUp, Sparkles, Shoe, Flame, UtensilsCrossed } from 'lucide-react';
import { Profile, Meal, DailyStats } from '@/lib/types';
import { MealSuggestions } from './MealSuggestions';

interface HomeViewProps {
  profile: Profile;
  meals: Meal[];
  stats: DailyStats | null;
}

export function HomeView({ profile, meals, stats }: HomeViewProps) {
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.total_calories,
    protein: acc.protein + meal.total_protein,
    fat: acc.fat + meal.total_fat,
    carbs: acc.carbs + meal.total_carbs,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  const burned = stats?.calories_burned || 500; // Default or real
  const consumed = totals.calories;
  const ratio = burned > 0 ? consumed / burned : 0;
  
  // Ratio 1 is best. Let's calculate a "score" or color based on closeness to 1
  const ratioCloseness = Math.max(0, 1 - Math.abs(1 - ratio));
  const ratioColor = ratio > 1.2 ? '#EF4444' : ratio < 0.8 ? '#3B82F6' : '#34D399';

  // Macro Targets (Calculated based on calorie target)
  const macroTargets = {
    protein: Math.round((profile.daily_calorie_target * 0.3) / 4),
    carbs: Math.round((profile.daily_calorie_target * 0.45) / 4),
    fat: Math.round((profile.daily_calorie_target * 0.25) / 9),
  };

  const macros = [
    { name: 'Protein', icon: '🥩', current: totals.protein, target: macroTargets.protein, color: '#34D399' },
    { name: 'Carbs', icon: '🍞', current: totals.carbs, target: macroTargets.carbs, color: '#FBBF24' },
    { name: 'Fat', icon: '🥑', current: totals.fat, target: macroTargets.fat, color: '#A78BFA' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10 max-w-md mx-auto"
    >
      {/* Daily Goal Label */}
      <motion.div variants={itemVariants} className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">Daily Summary</h1>
        <p className="text-white/40 text-sm font-medium">Goal: {profile.daily_calorie_target.toLocaleString()} kcal</p>
      </motion.div>

      {/* Aesthetic Ratio Circle */}
      <motion.div variants={itemVariants} className="flex flex-col items-center justify-center relative py-4">
        <div className="relative w-64 h-64">
          {/* Background Glow based on ratio */}
          <motion.div 
            animate={{ 
              backgroundColor: ratioColor,
              opacity: [0.1, 0.15, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-[60px]" 
          />
          
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Consumed Ring (Outer) */}
            <circle
              className="text-white/5"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <motion.circle
              strokeWidth="6"
              strokeDasharray={276}
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * Math.min(consumed / profile.daily_calorie_target, 1.5)) }}
              transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
              strokeLinecap="round"
              stroke={ratioColor}
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
              className="drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
            />

            {/* Burned Ring (Inner) */}
            <circle
              className="text-white/5"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="34"
              cx="50"
              cy="50"
            />
            <motion.circle
              strokeWidth="6"
              strokeDasharray={213}
              initial={{ strokeDashoffset: 213 }}
              animate={{ strokeDashoffset: 213 - (213 * Math.min(burned / 1000, 1.5)) }} // Target 1000 burned for scale
              transition={{ duration: 2.2, ease: "circOut", delay: 0.7 }}
              strokeLinecap="round"
              stroke="#F43F5E"
              fill="transparent"
              r="34"
              cx="50"
              cy="50"
              className="opacity-80"
            />
          </svg>
          
          {/* Center Content: Ratio */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="space-y-0"
            >
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Ratio</span>
              <div className="flex items-baseline justify-center gap-1">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-5xl font-black text-white"
                >
                  {ratio.toFixed(1)}
                </motion.span>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-[9px] text-white/40 font-bold uppercase tracking-tighter mt-1"
              >
                In / Out
              </motion.p>
            </motion.div>
          </div>

          {/* Realtime Indicators */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
            className="absolute -bottom-2 -left-4 bg-[#1C1C1E] border border-white/5 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-bold text-white">{consumed}</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
            className="absolute -bottom-2 -right-4 bg-[#1C1C1E] border border-white/5 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl"
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="text-sm font-bold text-white">{burned}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Macro Elements (from image) */}
      <div className="grid grid-cols-1 gap-3 px-2">
        {macros.map((macro, idx) => {
          const left = Math.max(0, macro.target - macro.current);
          const progress = Math.min((macro.current / macro.target) * 100, 100);
          
          return (
            <motion.div
              key={macro.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(28, 28, 30, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1C1C1E]/60 backdrop-blur-md rounded-[24px] p-4 border border-white/5 space-y-3 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.span 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                    className="text-2xl"
                  >
                    {macro.icon}
                  </motion.span>
                  <span className="text-lg font-bold text-white">{macro.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">{macro.current}</span>
                  <span className="text-[10px] font-bold text-white/30 uppercase ml-1">/ {macro.target}g</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 1 + idx * 0.1 }}
                  style={{ backgroundColor: macro.color }}
                  className="h-full rounded-full relative"
                >
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20"
                  />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-4 px-2">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-[#1C1C1E] rounded-[28px] p-5 space-y-4 border border-white/5 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-white/40 font-bold text-[10px] uppercase tracking-wider">Steps</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Footprints className="w-4 h-4 text-white/60 group-hover:text-primary transition-colors" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{(stats?.steps || 0).toLocaleString()}</p>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((stats?.steps || 0) / 10000) * 100, 100)}%` }}
              transition={{ duration: 2, delay: 1.5 }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-[#1C1C1E] rounded-[28px] p-5 space-y-4 border border-white/5 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-white/40 font-bold text-[10px] uppercase tracking-wider">Water</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">1.5<span className="text-lg ml-1 font-bold text-white/40">L</span></p>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 2, delay: 1.7 }}
              className="h-full bg-blue-500"
            />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <MealSuggestions profile={profile} />
      </motion.div>
    </motion.div>
  );
}
