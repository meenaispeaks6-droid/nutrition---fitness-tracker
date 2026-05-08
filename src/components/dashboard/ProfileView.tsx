'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from '@/lib/types';
import { 
  User, Settings, HelpCircle, ChevronRight, 
  Flame, Scale, Calendar, LogOut, CreditCard, Target, ArrowLeft, Ruler, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from './AvatarUpload';

type SubView = 'main' | 'details' | 'subscription' | 'settings' | 'goals';

export function ProfileView({ profile, onLogout, onProfileUpdate, isDemo = false }: { profile: Profile; onLogout: () => void; onProfileUpdate: (updates: Partial<Profile>) => void; isDemo?: boolean }) {
  const [activeView, setActiveView] = useState<SubView>('main');

  const stats = [
    { label: '14-Day', sublabel: 'Streak', value: '🔥', icon: <Flame className="w-5 h-5 text-orange-500" /> },
    { label: `${profile.weight_kg || '--'} kg`, sublabel: 'Weight', value: '', icon: <Scale className="w-5 h-5 text-emerald-500" /> },
    { label: `${profile.height_cm || '--'} cm`, sublabel: 'Height', value: '', icon: <Ruler className="w-5 h-5 text-blue-500" /> },
  ];

  const menuItems = [
    { id: 'details', label: 'My Details', icon: <User className="w-5 h-5 text-emerald-500" />, onClick: () => setActiveView('details') },
    { id: 'goals', label: 'My Goals', icon: <Target className="w-5 h-5 text-orange-500" />, onClick: () => setActiveView('goals') },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-5 h-5 text-blue-500" />, onClick: () => setActiveView('subscription') },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 text-slate-400" />, onClick: () => setActiveView('settings') },
  ];

  const renderMain = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="relative">
            <AvatarUpload 
              uid={profile.id} 
              url={profile.avatar_url} 
              onUpload={(url) => onProfileUpdate({ avatar_url: url })} 
              isDemo={isDemo} 
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter text-white">{profile.full_name || 'User'}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                {profile.age} Years
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/5">
                {profile.goal}
              </span>
            </div>
            <p className="text-xs text-white/30 font-medium">{profile.email}</p>
          </div>
        </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 rounded-[24px] flex flex-col items-center justify-center text-center space-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mb-1">
              {stat.icon}
            </div>
            <p className="text-sm font-bold leading-tight">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.sublabel}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {menuItems.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={item.onClick}
            className="w-full flex items-center justify-between p-4 rounded-[20px] glass-card hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>
        ))}

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 rounded-[20px] glass-card hover:bg-red-500/10 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-semibold text-red-500">Log Out</span>
          </div>
          <ChevronRight className="w-5 h-5 text-red-500/50 group-hover:text-red-500 transition-colors" />
        </motion.button>
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setActiveView('main')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">My Details</h2>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Full Name', value: profile.full_name },
          { label: 'Email', value: profile.email },
          { label: 'Age', value: `${profile.age} years` },
          { label: 'Height', value: `${profile.height_cm} cm` },
          { label: 'Weight', value: `${profile.weight_kg} kg` },
          { label: 'Gender', value: profile.gender || 'Not specified' },
        ].map((field, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{field.label}</p>
            <p className="font-bold text-lg">{field.value || 'Not set'}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderGoals = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setActiveView('main')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Health Goals</h2>
      </div>

      <div className="glass-card p-6 rounded-[32px] space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Primary Goal</p>
            <p className="text-xl font-black">{profile.goal === 'lose' ? 'Lose Weight' : profile.goal === 'gain' ? 'Gain Weight' : 'Maintain Weight'}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Daily Calorie Target</span>
              <span className="text-primary font-bold">{profile.daily_calorie_target} kcal</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Weekly Target</p>
              <p className="font-bold">-0.5 kg</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Target Date</p>
              <p className="font-bold">Dec 2024</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSubscription = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setActiveView('main')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Subscription</h2>
      </div>

      <div className="glass-card p-8 rounded-[32px] bg-gradient-to-br from-primary/20 to-transparent border-primary/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            Active Plan
          </div>
          <h3 className="text-3xl font-black mb-1 text-white">Fitbit Pro</h3>
          <p className="text-white/60 text-sm mb-8 font-medium">Next billing on Nov 26, 2024</p>

          <div className="space-y-3">
            {['Unlimited AI Scans', 'Deep Nutritional Insights', 'Custom Meal Plans', 'Priority Support'].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {feature}
              </div>
            ))}
          </div>

          <Button className="w-full mt-10 rounded-2xl font-bold h-12 bg-white text-black hover:bg-white/90">
            Manage Billing
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setActiveView('main')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Notifications', icon: <Clock className="w-5 h-5" /> },
          { label: 'Privacy & Security', icon: <Settings className="w-5 h-5" /> },
          { label: 'Units (Metric/Imperial)', icon: <Scale className="w-5 h-5" /> },
          { label: 'Language', icon: <User className="w-5 h-5" /> },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-5 glass-card rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground">{item.icon}</div>
              <span className="font-bold">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="pb-12">
      <AnimatePresence mode="wait">
        {activeView === 'main' && renderMain()}
        {activeView === 'details' && renderDetails()}
        {activeView === 'goals' && renderGoals()}
        {activeView === 'subscription' && renderSubscription()}
        {activeView === 'settings' && renderSettings()}
      </AnimatePresence>
    </div>
  );
}
