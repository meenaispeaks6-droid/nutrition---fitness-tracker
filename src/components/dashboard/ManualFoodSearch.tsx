'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Apple, Pizza, Coffee, Soup } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ManualFoodSearch() {
  const [search, setSearch] = useState('');

  const recent = [
    { name: 'Banana', kcal: 137, icon: '🍌' },
    { name: 'Oatmeal', kcal: 153, icon: '🥣' },
    { name: 'Greek Yogurt', kcal: 247, icon: '🥛' },
    { name: 'Sweet Potato', kcal: 103, icon: '🍠' },
  ];

  const frequent = [
    { name: 'Banana', kcal: 137, icon: '🍌' },
    { name: 'Oatmeal', kcal: 153, icon: '🥣' },
    { name: 'Greek Yogurt', kcal: 247, icon: '🥛' },
    { name: 'Sweet Potato', kcal: 103, icon: '🍠' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 min-h-screen bg-white dark:bg-slate-950 -mx-5 px-5 pt-4 pb-32"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search for food..." 
          className="pl-12 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold px-1">Recent</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {recent.map((item, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-32 glass-card rounded-[24px] p-4 flex flex-col items-center text-center space-y-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-3xl">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{item.kcal} kcal</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold px-1">Frequent</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {frequent.map((item, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-32 glass-card rounded-[24px] p-4 flex flex-col items-center text-center space-y-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-3xl">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{item.kcal} kcal</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-28 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg glow-primary"
        >
          <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
