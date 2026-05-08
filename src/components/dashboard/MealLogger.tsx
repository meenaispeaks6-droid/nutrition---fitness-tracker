'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, CheckCircle2, Sparkles, Zap, TrendingUp, Droplets, AlertCircle } from 'lucide-react';
import { FoodItem, Meal } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface MealLoggerProps {
  onMealLogged: (meal?: Meal) => void;
  isDemo?: boolean;
}

export function MealLogger({ onMealLogged, isDemo = false }: MealLoggerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    items: FoodItem[];
    totalCalories: number;
    nutrients: { protein: number; fat: number; carbs: number; fiber: number };
  } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const analysis = {
        food_items: [
          { name: 'Grilled Chicken Breast', calories: 280, protein: 42, fat: 8, carbs: 2, fiber: 0, portion_size: '150g' },
          { name: 'Mixed Greens Salad', calories: 120, protein: 4, fat: 6, carbs: 12, fiber: 4, portion_size: '1 bowl' },
          { name: 'Quinoa', calories: 110, protein: 4, fat: 2, carbs: 20, fiber: 3, portion_size: '80g' }
        ],
        total_calories: 510,
        total_protein: 50,
        total_fat: 16,
        total_carbs: 34,
        total_fiber: 7,
      };
      setResult({
        items: analysis.food_items,
        totalCalories: analysis.total_calories,
        nutrients: {
          protein: analysis.total_protein,
          fat: analysis.total_fat,
          carbs: analysis.total_carbs,
          fiber: analysis.total_fiber,
        },
      });
      
      const newMeal: Meal = {
        id: `demo-${Date.now()}`,
        user_id: 'demo-user',
        meal_type: 'lunch',
        food_items: analysis.food_items,
        total_calories: analysis.total_calories,
        total_protein: analysis.total_protein,
        total_fat: analysis.total_fat,
        total_carbs: analysis.total_carbs,
        total_fiber: analysis.total_fiber,
        created_at: new Date().toISOString()
      };
      onMealLogged(newMeal);
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('meal-photos').getPublicUrl(fileName);

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: JSON.stringify({ image: publicUrl }),
        headers: { 'Content-Type': 'application/json' },
      });
      const analysis = await response.json();

      if (!response.ok) {
        await supabase.storage.from('meal-photos').remove([fileName]);
        if (analysis.error === 'No food detected') {
          setError('No food detected in the image. Please upload a photo of food.');
        } else if (analysis.error === 'API quota exceeded') {
          setError('Service is temporarily busy. Please try again in a moment.');
        } else {
          setError(analysis.message || 'Failed to analyze the image. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (!analysis.food_items || analysis.food_items.length === 0) {
        await supabase.storage.from('meal-photos').remove([fileName]);
        setError('Could not identify any food items. Please try a clearer photo.');
        setLoading(false);
        return;
      }

      const getMealType = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'breakfast';
        if (hour >= 11 && hour < 16) return 'lunch';
        if (hour >= 16 && hour < 21) return 'dinner';
        return 'snack';
      };

      const { error: dbError } = await supabase.from('meals').insert({
        user_id: userId,
        meal_type: getMealType(),
        photo_url: publicUrl,
        food_items: analysis.food_items,
        total_calories: analysis.total_calories,
        total_protein: analysis.total_protein,
        total_fat: analysis.total_fat,
        total_carbs: analysis.total_carbs,
        total_fiber: analysis.total_fiber,
      });

      if (dbError) throw dbError;

      setResult({
        items: analysis.food_items,
        totalCalories: analysis.total_calories,
        nutrients: {
          protein: analysis.total_protein,
          fat: analysis.total_fat,
          carbs: analysis.total_carbs,
          fiber: analysis.total_fiber,
        },
      });
      onMealLogged();
    } catch (error) {
      console.error('Error logging meal:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-[28px] p-8 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/15 blur-[80px] rounded-full" />
            
            <div className="flex flex-col items-center justify-center text-center relative">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 glow-primary"
              >
                <Camera className="w-10 h-10 text-white" strokeWidth={1.5} />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-2">Snap Your Meal</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Our AI will instantly identify ingredients and calculate nutrition info
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 max-w-xs"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="rounded-2xl px-8 h-12 gradient-primary text-white font-semibold shadow-lg glow-sm" asChild>
                  <label className="cursor-pointer flex items-center gap-2">
                    <Upload className="w-5 h-5" strokeWidth={2} />
                    Upload Photo
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
                  </label>
                </Button>
              </motion.div>
              
              <p className="text-xs text-muted-foreground mt-4">Supports JPG, PNG up to 10MB</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-[28px] overflow-hidden">
              <div className="gradient-primary p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Analysis Complete</p>
                    <h3 className="text-lg font-bold">Meal Logged Successfully</h3>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{result.totalCalories}</span>
                  <span className="text-lg font-medium opacity-80">kcal</span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <NutrientPill icon={<TrendingUp className="w-4 h-4" />} label="Protein" value={result.nutrients.protein} unit="g" color="#6EE7B7" />
                  <NutrientPill icon={<Zap className="w-4 h-4" />} label="Carbs" value={result.nutrients.carbs} unit="g" color="#38BDF8" />
                  <NutrientPill icon={<Droplets className="w-4 h-4" />} label="Fat" value={result.nutrients.fat} unit="g" color="#FBBF24" />
                  <NutrientPill icon={<Sparkles className="w-4 h-4" />} label="Fiber" value={result.nutrients.fiber} unit="g" color="#A78BFA" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Detected Items</h4>
                  {result.items.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-2xl bg-secondary/50"
                    >
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.portion_size}</p>
                      </div>
                      <p className="font-bold text-primary">{item.calories} kcal</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl font-semibold glass-subtle" 
              onClick={() => setResult(null)}
            >
              Log Another Meal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[70]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 rounded-[32px] flex flex-col items-center max-w-xs mx-4 text-center"
            >
              <div className="relative mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Analyzing Your Meal</h3>
              <p className="text-sm text-muted-foreground">AI is identifying ingredients and calculating nutrition...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NutrientPill({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number; unit: string; color: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-secondary/50">
      <span style={{ color }} className="mb-1">{icon}</span>
      <span className="text-lg font-black">{Math.round(value)}<span className="text-xs font-medium">{unit}</span></span>
      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
