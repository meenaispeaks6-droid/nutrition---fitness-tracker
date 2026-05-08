'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Clock, TrendingUp, Activity,
  Utensils, Flame, UserPlus, Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  adminCount: number;
  activeToday: number;
  activeMonth: number;
  newUsersThisWeek: number;
  totalMeals: number;
  avgCalories: number;
  userGrowth: number[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    adminCount: 0,
    activeToday: 0,
    activeMonth: 0,
    newUsersThisWeek: 0,
    totalMeals: 0,
    avgCalories: 0,
    userGrowth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, value, icon: Icon, color, subtitle, change
  }: { 
    title: string; value: string | number; icon: any; color: string; subtitle?: string; change?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-zinc-500">{title}</p>
      {subtitle && <p className="text-xs text-emerald-500 mt-1">{subtitle}</p>}
    </motion.div>
  );

  const dauMauRatio = stats.activeMonth > 0 
    ? ((stats.activeToday / stats.activeMonth) * 100).toFixed(1) 
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-zinc-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            subtitle={`${stats.adminCount} admins`}
          />
          <StatCard
            title="Active Today"
            value={stats.activeToday.toLocaleString()}
            icon={UserCheck}
            color="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatCard
            title="Active This Month"
            value={stats.activeMonth.toLocaleString()}
            icon={Clock}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatCard
            title="New This Week"
            value={stats.newUsersThisWeek.toLocaleString()}
            icon={UserPlus}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">User Growth</h2>
                <p className="text-sm text-zinc-500">Last 30 days</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs text-zinc-400">Cumulative Users</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-1">
              {stats.userGrowth.length > 0 ? stats.userGrowth.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(5, (value / Math.max(...stats.userGrowth, 1)) * 100)}%` }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500/60 rounded-t-sm hover:from-emerald-500/30 hover:to-emerald-500/80 transition-colors cursor-pointer"
                  title={`Day ${i + 1}: ${value} users`}
                />
              )) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">No growth data available</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Key Metrics</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-zinc-800/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-zinc-400">DAU/MAU Ratio</span>
                </div>
                <p className="text-3xl font-bold text-white">{dauMauRatio}%</p>
                <p className="text-xs text-emerald-500 mt-1">App Stickiness Index</p>
              </div>

              <div className="p-4 bg-zinc-800/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-violet-500" />
                  <span className="text-sm text-zinc-400">Admin Users</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.adminCount}</p>
                <p className="text-xs text-violet-500 mt-1">With full access</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-500/20 to-zinc-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-lg font-medium text-zinc-300">Total Meals Logged</span>
            </div>
            <p className="text-5xl font-bold text-emerald-400 mb-2">
              {stats.totalMeals.toLocaleString()}
            </p>
            <p className="text-zinc-500">Across all users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-orange-500/20 to-zinc-900/50 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-lg font-medium text-zinc-300">Avg. Daily Calories</span>
            </div>
            <p className="text-5xl font-bold text-orange-400 mb-2">
              {stats.avgCalories.toLocaleString()}
            </p>
            <p className="text-zinc-500">Per user average</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
