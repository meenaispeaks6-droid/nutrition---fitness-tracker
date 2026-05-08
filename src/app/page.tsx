'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/auth/Auth';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { NutriDashboard } from '@/components/dashboard/NutriDashboard';
import { MealSuggestions } from '@/components/dashboard/MealSuggestions';
import { Profile } from '@/lib/types';
import { Loader2, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isDemo) {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isDemo) {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setSession(null);
      setProfile(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  const handleDemoLogin = () => {
    setIsDemo(true);
    setSession({ user: { id: 'demo-user', email: 'demo@example.com' } });
    setProfile({
      id: 'demo-user',
      email: 'demo@example.com',
      full_name: 'Guest User',
      goal: 'maintain',
      dietary_restrictions: ['Gluten-Free'],
      daily_calorie_target: 2200,
      weight_kg: 75,
      height_cm: 180,
      age: 26,
      created_at: new Date().toISOString()
    } as Profile);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary animate-pulse">
            <Leaf className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return <Auth onDemoLogin={handleDemoLogin} />;
  }

  if (!profile) {
    return <Onboarding onComplete={() => fetchProfile(session.user.id)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NutriDashboard profile={profile} onLogout={handleLogout} isDemo={isDemo} />
    </div>
  );
}
