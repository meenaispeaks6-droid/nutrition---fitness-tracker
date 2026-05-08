'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, LogOut, TrendingUp, Target, User, Home, BarChart2, Activity, Sparkles, Camera, Mic, X, Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile, Meal, DailyStats } from '@/lib/types';
import { MealLogger } from './MealLogger';
import { HomeView } from './HomeView';
import { ProfileView } from './ProfileView';
import { ActivityHistoryView } from './ActivityHistoryView';
import { GoalsView } from './GoalsView';
import { AIInputHub } from './AIInputHub';
import { AIAnalysisResults } from './AIAnalysisResults';
import { motion, AnimatePresence } from 'framer-motion';

export function NutriDashboard({ profile: initialProfile, onLogout, isDemo = false }: { profile: Profile; onLogout: () => void; isDemo?: boolean }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setMeals([
        {
          id: 'demo-meal-1',
          user_id: 'demo-user',
          meal_type: 'breakfast',
          food_items: [{ name: 'Oatmeal with Berries', calories: 350, protein: 12, fat: 8, carbs: 58, fiber: 8, portion_size: '1 bowl' }],
          total_calories: 350,
          total_protein: 12,
          total_fat: 8,
          total_carbs: 58,
          total_fiber: 8,
          created_at: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: 'demo-meal-2',
          user_id: 'demo-user',
          meal_type: 'lunch',
          food_items: [{ name: 'Grilled Chicken Salad', calories: 480, protein: 38, fat: 18, carbs: 24, fiber: 6, portion_size: '1 plate' }],
          total_calories: 480,
          total_protein: 38,
          total_fat: 18,
          total_carbs: 24,
          total_fiber: 6,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
      setStats({
        id: 'demo-stats',
        user_id: 'demo-user',
        date: new Date().toISOString().split('T')[0],
        steps: 7245,
        calories_burned: 300,
        exercise_minutes: 45,
        created_at: new Date().toISOString()
      });
    } else {
      fetchDailyData();
    }
  }, [isDemo]);

  const fetchDailyData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: mealsData } = await supabase
      .from('meals')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    
    if (mealsData) setMeals(mealsData);

    const dateStr = today.toISOString().split('T')[0];
    const { data: statsData } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', dateStr)
      .single();
    if (statsData) setStats(statsData);
  };

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snack';
  };

  const handleAnalysisStart = async (type: string, data: any) => {
    setAnalyzing(true);
    setAnalysisError(null);
    setIsLogging(false);

    try {
      if (type === 'photo') {
        const file = data as File;
        if (!file) throw new Error('No image file selected');

        if (isDemo) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const mockResult = {
            items: [
              { name: 'Double Cheeseburger', calories: 650, protein: 35, fat: 38, carbs: 42, fiber: 2, portion_size: '250g' },
              { name: 'Large Fries', calories: 450, protein: 5, fat: 22, carbs: 58, fiber: 5, portion_size: '150g' }
            ],
            totalCalories: 1100,
            nutrients: { protein: 40, fat: 60, carbs: 100, fiber: 7 },
            photoUrl: URL.createObjectURL(file)
          };
          setAnalysisResult(mockResult);
          setShowResults(true);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) throw new Error('User not authenticated');

        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meals')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('meals').getPublicUrl(fileName);

        const response = await fetch('/api/analyze-food', {
          method: 'POST',
          body: JSON.stringify({ image: publicUrl }),
          headers: { 'Content-Type': 'application/json' },
        });

        const analysis = await response.json();

        if (!response.ok) {
          await supabase.storage.from('meals').remove([fileName]);
          throw new Error(analysis.message || analysis.error || 'Analysis failed');
        }

        setAnalysisResult({
          items: analysis.food_items,
          totalCalories: analysis.total_calories,
          nutrients: {
            protein: analysis.total_protein,
            fat: analysis.total_fat,
            carbs: analysis.total_carbs,
            fiber: analysis.total_fiber,
          },
          photoUrl: publicUrl
        });
        setShowResults(true);
      } else {
        const textData = data as string;
        if (!textData) throw new Error('No description provided');

        if (isDemo) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setAnalysisResult({
            items: [{ name: textData, calories: 450, protein: 25, fat: 15, carbs: 45, fiber: 5, portion_size: '1 serving' }],
            totalCalories: 450,
            nutrients: { protein: 25, fat: 15, carbs: 45, fiber: 5 },
            photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop"
          });
          setShowResults(true);
          return;
        }

        const response = await fetch('/api/analyze-food', {
          method: 'POST',
          body: JSON.stringify({ text: textData }),
          headers: { 'Content-Type': 'application/json' },
        });

        const analysis = await response.json();

        if (!response.ok) {
          throw new Error(analysis.message || analysis.error || 'Analysis failed');
        }

        setAnalysisResult({
          items: analysis.food_items,
          totalCalories: analysis.total_calories,
          nutrients: {
            protein: analysis.total_protein,
            fat: analysis.total_fat,
            carbs: analysis.total_carbs,
            fiber: analysis.total_fiber,
          },
          photoUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop"
        });
        setShowResults(true);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Something went wrong');
      // If it was a food detection error, don't just show results, stay on hub
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmLog = async () => {
    if (analysisResult && !isDemo) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { error: dbError } = await supabase.from('meals').insert({
          user_id: userData.user?.id,
          meal_type: getMealType(),
          photo_url: analysisResult.photoUrl,
          food_items: analysisResult.items,
          total_calories: analysisResult.totalCalories,
          total_protein: analysisResult.nutrients.protein,
          total_fat: analysisResult.nutrients.fat,
          total_carbs: analysisResult.nutrients.carbs,
          total_fiber: analysisResult.nutrients.fiber,
        });

        if (dbError) throw dbError;
        fetchDailyData();
      } catch (err) {
        console.error('Save error:', err);
      }
    }
    
    setShowResults(false);
    setAnalysisResult(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'goals':
        return <GoalsView userId={profile.id} isDemo={isDemo} />;
      case 'stats':
        return <ActivityHistoryView meals={meals} stats={stats} />;
        case 'profile':
          return <ProfileView profile={profile} onLogout={onLogout} onProfileUpdate={(updates) => setProfile(prev => ({ ...prev, ...updates }))} isDemo={isDemo} />;

      case 'home':
      default:
        return <HomeView profile={profile} meals={meals} stats={stats} />;
    }
  };

  const firstName = profile.full_name?.split(' ')[0] || 'Alex';

  return (
    <div className="min-h-screen bg-[#121212] pb-[calc(12rem+env(safe-area-inset-bottom))] transition-colors duration-500 font-sans">
      {/* Top Header */}
      <header className="px-6 py-[calc(1.5rem+env(safe-area-inset-top))] flex justify-between items-center max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full overflow-hidden border border-white/10"
        >
            <img 
              src={profile.avatar_url || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/OIP-1767294362062.webp?width=8000&height=8000&resize=contain"} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          className="relative text-white/60 hover:text-white cursor-pointer"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121212]" />
        </motion.div>
      </header>

      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-8">
          <div className="max-w-md mx-auto">
            <div className="relative h-20 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <NavButton icon={<Home />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <NavButton icon={<Activity />} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
              
              {/* Floating Action Button */}
              <div className="relative -mt-16">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <button 
                  onClick={() => setIsLogging(true)}
                  className="relative w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>

              <NavButton icon={<Target />} active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
              <NavButton icon={<User />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>
          </div>
      </div>


      <AnimatePresence>
          {isLogging && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                onClick={() => setIsLogging(false)}
              />
              <AIInputHub 
                onClose={() => setIsLogging(false)}
                onAnalysisStart={handleAnalysisStart}
              />
            </>
          )}

          {analyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="glass-card p-8 rounded-[32px] flex flex-col items-center max-w-xs text-center">
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
                <h3 className="font-bold text-lg mb-2 text-white">Analyzing Your Meal</h3>
                <p className="text-sm text-white/60 leading-relaxed">AI is identifying ingredients and calculating nutrition info...</p>
              </div>
            </motion.div>
          )}

          {analysisError && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-6 right-6 z-[120] max-w-lg mx-auto"
            >
              <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-red-400/20">
                <p className="text-sm font-bold">{analysisError}</p>
                <button 
                  onClick={() => setAnalysisError(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        {showResults && analysisResult && (
          <AIAnalysisResults 
            data={analysisResult}
            onConfirm={handleConfirmLog}
            onBack={() => {
              setShowResults(false);
              setIsLogging(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon, active, onClick, className }: { icon: React.ReactNode, active: boolean, onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${active ? 'text-primary' : 'text-white/20 hover:text-white/40'} ${className}`}
    >
      {React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 22, strokeWidth: active ? 3 : 2 })}
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-primary/5 rounded-2xl blur-md"
        />
      )}
    </button>
  );
}
