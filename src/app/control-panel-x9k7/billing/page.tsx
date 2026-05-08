'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, Filter,
  CheckCircle, Clock, XCircle, CreditCard, Users, Zap
} from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  plan: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
}

export default function AdminBillingPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const mockTransactions: Transaction[] = [
    { id: 'txn_1001', userId: 'u1', userName: 'Sarah Johnson', email: 'sarah@email.com', amount: 9.99, plan: 'Monthly Premium', status: 'success', date: new Date().toISOString() },
    { id: 'txn_1002', userId: 'u2', userName: 'Ahmed Khan', email: 'ahmed@email.com', amount: 79.99, plan: 'Annual Premium', status: 'success', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'txn_1003', userId: 'u3', userName: 'Maria Garcia', email: 'maria@email.com', amount: 9.99, plan: 'Monthly Premium', status: 'pending', date: new Date(Date.now() - 172800000).toISOString() },
    { id: 'txn_1004', userId: 'u4', userName: 'James Wilson', email: 'james@email.com', amount: 14.99, plan: 'Family Plan', status: 'success', date: new Date(Date.now() - 259200000).toISOString() },
    { id: 'txn_1005', userId: 'u5', userName: 'Priya Sharma', email: 'priya@email.com', amount: 9.99, plan: 'Monthly Premium', status: 'failed', date: new Date(Date.now() - 345600000).toISOString() },
    { id: 'txn_1006', userId: 'u6', userName: 'Michael Brown', email: 'michael@email.com', amount: 79.99, plan: 'Annual Premium', status: 'success', date: new Date(Date.now() - 432000000).toISOString() },
    { id: 'txn_1007', userId: 'u7', userName: 'Emma Davis', email: 'emma@email.com', amount: 9.99, plan: 'Monthly Premium', status: 'success', date: new Date(Date.now() - 518400000).toISOString() },
    { id: 'txn_1008', userId: 'u8', userName: 'Ali Hassan', email: 'ali@email.com', amount: 14.99, plan: 'Family Plan', status: 'pending', date: new Date(Date.now() - 604800000).toISOString() },
  ];

  const stats = {
    monthlyRevenue: 42580,
    revenueChange: 23.4,
    premiumUsers: 4250,
    freeUsers: 14170,
    churnRate: 4.2,
  };

  const filteredTransactions = filterStatus === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => t.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/15 text-emerald-400';
      case 'pending': return 'bg-amber-500/15 text-amber-400';
      case 'failed': return 'bg-red-500/15 text-red-400';
      default: return 'bg-zinc-500/15 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Subscription & Billing</h1>
            <p className="text-zinc-500">Manage subscriptions and view transactions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500/20 to-zinc-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-sm text-zinc-400">Monthly Revenue</span>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-emerald-400">${stats.monthlyRevenue.toLocaleString()}</p>
              <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.revenueChange}%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-sm text-zinc-400">Churn Rate</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.churnRate}%</p>
            <p className="text-sm text-zinc-500 mt-2">Users who didn&apos;t renew</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Subscription Breakdown</span>
              <span className="text-xs text-emerald-500 font-semibold">
                {Math.round(stats.premiumUsers / (stats.premiumUsers + stats.freeUsers) * 100)}% Premium
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                style={{ width: `${(stats.premiumUsers / (stats.premiumUsers + stats.freeUsers)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                Premium: {stats.premiumUsers.toLocaleString()}
              </span>
              <span className="text-zinc-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-zinc-600" />
                Free: {stats.freeUsers.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-zinc-800/50">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-6 gap-4 px-6 py-3 border-b border-zinc-800/30 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div>Transaction ID</div>
            <div className="col-span-2">User</div>
            <div>Plan</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          {filteredTransactions.map((txn, idx) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-2 lg:grid-cols-6 gap-4 px-6 py-4 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors"
            >
              <div className="text-zinc-400 font-mono text-sm">{txn.id}</div>
              <div className="col-span-2 hidden lg:block">
                <p className="text-white font-medium">{txn.userName}</p>
                <p className="text-sm text-zinc-500">{txn.email}</p>
              </div>
              <div className="lg:hidden col-span-1">
                <p className="text-white font-medium">{txn.userName}</p>
              </div>
              <div className="hidden lg:flex items-center text-zinc-300">{txn.plan}</div>
              <div className="flex items-center text-emerald-400 font-semibold">${txn.amount.toFixed(2)}</div>
              <div className="flex items-center justify-end lg:justify-start">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(txn.status)}`}>
                  {getStatusIcon(txn.status)}
                  <span className="capitalize">{txn.status}</span>
                </span>
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-zinc-500">No transactions found</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
