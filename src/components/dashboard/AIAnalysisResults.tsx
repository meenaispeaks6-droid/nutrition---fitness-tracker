'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, TrendingUp, Zap, Droplets, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FoodItem, Meal } from '@/lib/types';

interface AIAnalysisResultsProps {
  data: {
    items: FoodItem[];
    totalCalories: number;
    nutrients: { protein: number; fat: number; carbs: number; fiber: number };
    photoUrl?: string;
  };
  onConfirm: () => void;
  onBack: () => void;
}

export function AIAnalysisResults({ data, onConfirm, onBack }: AIAnalysisResultsProps) {
  const [items, setItems] = useState(data.items);

  const handleWeightChange = (index: number, newWeight: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const oldWeight = parseInt(item.portion_size || '100') || 100;
    const ratio = newWeight / oldWeight;
    
    newItems[index] = {
      ...item,
      portion_size: `${newWeight}g`,
      calories: Math.round(item.calories * ratio),
      protein: Math.round(item.protein * ratio),
      fat: Math.round(item.fat * ratio),
      carbs: Math.round(item.carbs * ratio),
    };
    setItems(newItems);
  };

  const totals = items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    fat: acc.fat + item.fat,
    carbs: acc.carbs + item.carbs,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[110] bg-[#121212] flex flex-col overflow-y-auto scrollbar-hide"
    >
      {/* Top Image Section */}
      <div className="relative h-[35vh] w-full">
        <img 
          src={data.photoUrl || "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?q=80&w=1000&auto=format&fit=crop"} 
          alt="Analyzed food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-12 h-12 rounded-2xl glass flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">AI Magic Breakdown</span>
          </motion.div>
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 px-6 pb-32 -mt-4 relative z-10">
        <div className="space-y-6">
          {/* Main Card */}
          <div className="glass-card rounded-[32px] p-6 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Total Calories</p>
                <h2 className="text-5xl font-black text-primary">{totals.calories} <span className="text-xl font-medium text-white/40">kcal</span></h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <MacroMiniCard label="Protein" value={totals.protein} color="#00E676" icon={<TrendingUp className="w-4 h-4" />} />
              <MacroMiniCard label="Carbs" value={totals.carbs} color="#00E676" icon={<Zap className="w-4 h-4" />} />
              <MacroMiniCard label="Fat" value={totals.fat} color="#00E676" icon={<Droplets className="w-4 h-4" />} />
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Adjust Ingredients</h4>
              {items.map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-white/40">{item.portion_size} • {item.calories} kcal</p>
                    </div>
                    <span className="text-sm font-bold text-primary">Edit</span>
                  </div>
                    <Slider
                      defaultValue={[parseInt(item.portion_size || '100') || 100]}
                      max={500}
                    step={5}
                    onValueChange={([val]) => handleWeightChange(i, val)}
                    className="py-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent">
        <Button 
          onClick={onConfirm}
          className="w-full h-16 rounded-[24px] bg-primary text-black font-black text-lg shadow-[0_0_30px_rgba(0,230,118,0.3)] hover:scale-[1.02] transition-transform"
        >
          CONFIRM LOG <Check className="ml-2 w-6 h-6" strokeWidth={3} />
        </Button>
      </div>
    </motion.div>
  );
}

function MacroMiniCard({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-black">{Math.round(value)}g</p>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
