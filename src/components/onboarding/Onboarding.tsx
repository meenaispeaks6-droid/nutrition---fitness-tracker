'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Goal } from '@/lib/types';
import { ChevronRight, ChevronLeft, Target, Utensils, User, Sparkles, TrendingDown, Anchor, TrendingUp, Leaf, Wheat, CircleOff, Beef, CheckCircle2, ArrowRight } from 'lucide-react';

const DIETARY_OPTIONS = [
  { id: 'Vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'Gluten-Free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'Nut-Free', label: 'Nut-Free', emoji: '🥜' },
  { id: 'Dairy-Free', label: 'Dairy-Free', emoji: '🥛' },
  { id: 'Keto', label: 'Keto', emoji: '🥩' },
  { id: 'Shellfish-Free', label: 'Shellfish-Free', emoji: '🦐' },
];

const MISSION_OPTIONS = [
  { id: 'lose', label: 'Lose Weight', icon: TrendingDown, color: 'text-blue-500' },
  { id: 'maintain', label: 'Maintain', icon: Anchor, color: 'text-slate-500' },
  { id: 'gain', label: 'Gain Muscle', icon: TrendingUp, color: 'text-red-400' },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'other',
    motto: '',
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const weight = parseFloat(stats.weight) || 70;
    const height = parseFloat(stats.height) || 170;
    const age = parseInt(stats.age) || 25;
    
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    let tdee = bmr * 1.2;
    
    let target = Math.round(tdee);
    if (goal === 'lose') target -= 500;
    if (goal === 'gain') target += 500;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      goal: goal,
      dietary_restrictions: restrictions,
      weight_kg: weight,
      height_cm: height,
      age: age,
      motto: stats.motto,
      daily_calorie_target: target,
      created_at: new Date().toISOString()
    });

    if (!error) onComplete();
  };

  const toggleRestriction = (res: string) => {
    setRestrictions((prev) =>
      prev.includes(res) ? prev.filter((r) => r !== res) : [...prev, res]
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5 bg-background relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative">
        <div className="glass-card rounded-[40px] p-8 min-h-[600px] flex flex-col border border-white/5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <h2 className="text-[28px] font-black text-foreground flex items-center gap-2 mb-6">
                    What's the mission? <span className="text-2xl">🎯</span>
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {MISSION_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGoal(opt.id as Goal)}
                        className={`relative aspect-[4/5] rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all ${
                          goal === opt.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-white/60 hover:bg-muted/80'
                        }`}
                      >
                        {goal === opt.id && (
                          <div className="absolute top-2 right-2 bg-background rounded-full p-0.5">
                            <CheckCircle2 className="w-4 h-4 text-primary fill-background" />
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-background shadow-sm border border-white/5">
                          <opt.icon className={`w-6 h-6 ${opt.color}`} />
                        </div>
                        <span className="text-sm font-bold leading-tight px-2">{opt.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                  <div className="mb-8">
                    <h2 className="text-[28px] font-black text-foreground flex items-center gap-2 mb-6">
                      Any allergies or restrictions? <span className="text-2xl">🥑</span>
                    </h2>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((res) => (
                      <motion.button
                        key={res.id}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all ${
                          restrictions.includes(res.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-white/60 hover:bg-muted/80'
                        }`}
                        onClick={() => toggleRestriction(res.id)}
                      >
                        <span className="text-lg">{res.emoji}</span>
                        <span className="text-sm">{res.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1"
              >
                <div className="mb-8">
                  <h2 className="text-[28px] font-black text-foreground flex items-center gap-2 mb-6">
                    Final details <span className="text-2xl">⚡</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 font-medium">To calculate your perfect daily targets.</p>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">My Motto</Label>
                        <Input
                          placeholder="Eat clean, train mean 🚀"
                          value={stats.motto}
                          onChange={(e) => setStats({ ...stats, motto: e.target.value })}
                          className="h-16 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-lg font-bold px-6 text-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Weight (kg)</Label>
                        <Input
                          type="number"
                          placeholder="70"
                          value={stats.weight}
                          onChange={(e) => setStats({ ...stats, weight: e.target.value })}
                          className="h-16 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-lg font-bold px-6 text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Height (cm)</Label>
                        <Input
                          type="number"
                          placeholder="175"
                          value={stats.height}
                          onChange={(e) => setStats({ ...stats, height: e.target.value })}
                          className="h-16 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-lg font-bold px-6 text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Age</Label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={stats.age}
                        onChange={(e) => setStats({ ...stats, age: e.target.value })}
                        className="h-16 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-lg font-bold px-6 text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            <Button
              className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-lg glow-sm transition-all flex items-center justify-center gap-2"
              onClick={step === 2 ? handleSubmit : handleNext}
            >
              {step === 2 ? 'Launch App' : 'Next'} <ArrowRight className="w-5 h-5" />
            </Button>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="text-muted-foreground font-bold text-sm hover:text-foreground transition-colors py-2"
              >
                Go back
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-primary' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
