'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, Meal } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronLeft, ChevronRight, X, Trash2,
  Calendar, Target, CheckCircle, Utensils, AlertTriangle, Loader2
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userMeals, setUserMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const rowsPerPage = 10;

  const dietOptions = ['All', 'Keto', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Paleo', 'None'];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        search: searchQuery,
        diet: dietFilter,
      });
      
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, dietFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const fetchUserMeals = async (userId: string) => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    setUserMeals(data || []);
  };

  const handleUserClick = async (user: Profile) => {
    setSelectedUser(user);
    await fetchUserMeals(user.id);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      setDeleteConfirm(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: '2-digit'
    });
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="min-h-screen bg-[#121212] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-zinc-500">{total} total users</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <select
              value={dietFilter}
              onChange={(e) => {
                setDietFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-12 pr-8 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {dietOptions.map(diet => (
                <option key={diet} value={diet}>{diet}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl overflow-hidden"
        >
          <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-4 border-b border-zinc-800/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">User</div>
            <div>Joined</div>
            <div>Last Active</div>
            <div>Goal</div>
            <div>Diet</div>
            <div>Status</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">No users found</div>
          ) : (
            users.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleUserClick(user)}
                className="grid grid-cols-2 lg:grid-cols-7 gap-4 px-6 py-4 border-b border-zinc-800/30 hover:bg-zinc-800/30 cursor-pointer transition-colors"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-500 font-bold">
                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      {user.full_name || 'No name'}
                      {user.is_admin && (
                        <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-bold rounded">ADMIN</span>
                      )}
                    </p>
                    <p className="text-sm text-zinc-500 truncate max-w-[200px]">{user.email}</p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center text-zinc-400 text-sm">
                  {formatDate(user.created_at)}
                </div>
                <div className="hidden lg:flex items-center text-zinc-400 text-sm">
                  {formatTimeAgo(user.created_at)}
                </div>
                <div className="hidden lg:flex items-center">
                  <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-300 capitalize">
                    {user.goal || 'Not set'}
                  </span>
                </div>
                <div className="hidden lg:flex items-center">
                  <span className="text-sm text-zinc-400">
                    {user.dietary_restrictions?.join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-end lg:justify-start">
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </motion.div>
            ))
          )}

          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/50">
            <p className="text-sm text-zinc-500">
              Showing {Math.min(currentPage * rowsPerPage + 1, total)}-{Math.min((currentPage + 1) * rowsPerPage, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 5) {
                  if (currentPage < 3) pageNum = i;
                  else if (currentPage > totalPages - 4) pageNum = totalPages - 5 + i;
                  else pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-500 text-2xl font-bold mb-4">
                    {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.full_name || 'No name'}</h3>
                  <p className="text-zinc-500">{selectedUser.email}</p>
                  {selectedUser.is_admin && (
                    <span className="inline-block mt-2 px-2 py-1 bg-violet-500/20 text-violet-400 text-xs font-bold rounded">ADMIN</span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-500 flex items-center gap-2"><Target className="w-4 h-4" /> Goal</span>
                    <span className="text-white capitalize">{selectedUser.goal || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-500 flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet</span>
                    <span className="text-white">{selectedUser.dietary_restrictions?.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined</span>
                    <span className="text-white">{formatDate(selectedUser.created_at)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-zinc-800">
                    <span className="text-zinc-500">Daily Calories</span>
                    <span className="text-white">{selectedUser.daily_calorie_target || 0} kcal</span>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-4">Recent Meals</h4>
                {userMeals.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No meals logged yet</p>
                ) : (
                  <div className="space-y-3 mb-8">
                    {userMeals.map(meal => (
                      <div key={meal.id} className="p-4 bg-zinc-800/50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-medium capitalize">{meal.meal_type}</span>
                          <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs">
                            {meal.total_calories} kcal
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {meal.food_items?.map((f: any) => f.name).join(', ') || 'No items'}
                        </p>
                        <p className="text-xs text-zinc-600 mt-2">
                          {new Date(meal.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {!selectedUser.is_admin && (
                  <div className="pt-4 border-t border-zinc-800">
                    {deleteConfirm === selectedUser.id ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 mb-3">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-semibold">Confirm Delete</span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">This will permanently delete the user and all their data.</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteUser(selectedUser.id)}
                            disabled={deleting}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                          >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(selectedUser.id)}
                        className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete User
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
