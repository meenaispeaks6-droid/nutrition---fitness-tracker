'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Sparkles, ArrowRight, Coffee, Sun, Moon, Phone, Smartphone, Apple } from 'lucide-react';

const mealData = [
  {
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1920&q=80',
    meal: 'Breakfast',
    icon: Coffee,
    hours: [5, 6, 7, 8, 9, 10, 11]
  },
  {
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80',
    meal: 'Lunch',
    icon: Sun,
    hours: [12, 13, 14, 15]
  },
  {
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=1920&q=80',
    meal: 'Dinner',
    icon: Moon,
    hours: [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]
  },
];

const getMealByTime = () => {
  const hour = new Date().getHours();
  return mealData.find(m => m.hours.includes(hour)) || mealData[0];
};

const AnimatedFoodBackground = () => {
  const [currentMeal, setCurrentMeal] = useState(getMealByTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMeal(getMealByTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const MealIcon = currentMeal.icon;

    return (
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          key={currentMeal.meal}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentMeal.image})` }}
          />
          {/* Add a dark overlay to ensure text visibility */}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-20"
        >
          <MealIcon className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">Today&apos;s {currentMeal.meal}</span>
        </motion.div>
      </div>
    );
  };


export function Auth({ onDemoLogin }: { onDemoLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!showOtpInput) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
      });
      if (error) {
        setMessage(error.message);
      } else {
        setShowOtpInput(true);
        setMessage('OTP sent to your phone!');
      }
    } else {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        token: otp,
        type: 'sms',
      });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      <AnimatedFoodBackground />
      
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-1/4 left-1/4 w-12 h-12 bg-primary/20 blur-xl rounded-full"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-primary/10 blur-2xl rounded-full"
        />
        <motion.div
          animate={{
            rotate: 360,
            transition: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute -bottom-10 -left-10 w-40 h-40 border border-white/5 rounded-full"
        />
      </div>
      
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm relative z-10"
        >
          <div className="bg-black/60 backdrop-blur-2xl rounded-[2.5rem] p-8 relative overflow-hidden border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            {/* Glossy highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 glow-primary shadow-2xl relative group"
              >
                <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Leaf className="w-10 h-10 text-white" strokeWidth={2.5} />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tighter mb-2 text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                FITBIT.AI
              </h1>
              <p className="text-sm text-white/70 text-center font-medium max-w-[200px]">
                Your personal AI chef and nutrition companion
              </p>
            </motion.div>


            <motion.div variants={itemVariants}>
              <AnimatePresence mode="wait">
                {!showOtpInput ? (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleEmailLogin}
                    className="space-y-4"
                  >
                    <div className="group relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" strokeWidth={1.5} />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white text-base placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all hover:bg-white/10"
                      />
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-bold text-base gradient-primary text-white shadow-xl glow-sm relative overflow-hidden group"
                        disabled={loading}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Syncing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Get Started
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handlePhoneLogin}
                    className="space-y-4"
                  >
                    <div className="group relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" strokeWidth={1.5} />
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                        className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white text-base tracking-[0.5em] font-black placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all hover:bg-white/10 text-center placeholder:tracking-normal"
                      />
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-bold text-base gradient-primary text-white shadow-xl glow-sm relative overflow-hidden group"
                        disabled={loading}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Verifying...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Verify Code
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                    <button 
                      type="button" 
                      onClick={() => setShowOtpInput(false)}
                      className="w-full text-center text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Back to email
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="relative py-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#121212]/80 backdrop-blur-md px-4 text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">OR CONNECT WITH</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center gap-4">
              {[
                { icon: 'google', label: 'Google', onClick: () => handleSocialLogin('google') },
                { icon: Apple, label: 'Apple', onClick: () => handleSocialLogin('apple') },
                { icon: Phone, label: 'Phone', onClick: () => {
                  const p = prompt('Phone number:');
                  if(p) { setPhone(p); handlePhoneLogin({preventDefault:()=>{}} as any); }
                }},
                { icon: Sparkles, label: 'Guest', onClick: onDemoLogin }
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={btn.onClick}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-xl group"
                  title={btn.label}
                >
                  {typeof btn.icon === 'string' ? (
                    <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ) : (
                    <btn.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  )}
                </motion.button>
              ))}
            </motion.div>


            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`text-center text-xs font-bold p-3 mt-6 rounded-xl border ${message.toLowerCase().includes('error') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/10 border-primary/20 text-primary'}`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        <motion.p 
          variants={itemVariants}
          className="mt-6 text-center text-[10px] text-white/30 font-bold uppercase tracking-widest"
        >
          By continuing, you agree to our <span className="text-white/60 hover:text-white cursor-pointer transition-colors underline decoration-white/20">Terms</span> & <span className="text-white/60 hover:text-white cursor-pointer transition-colors underline decoration-white/20">Privacy</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
