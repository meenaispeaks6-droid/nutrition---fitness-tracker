'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, UserPlus, Trash2, Mail, Loader2, CheckCircle,
  AlertTriangle, X, Copy, Check, Key
} from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdmins(data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAdding(true);

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (data.tempPassword) {
        setNewAdminCredentials({
          email: email.trim().toLowerCase(),
          password: data.tempPassword,
        });
      }

      setSuccess(data.message);
      setEmail('');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to add admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    setRemoving(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setRemoveConfirm(null);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to remove admin');
    } finally {
      setRemoving(false);
    }
  };

  const copyCredentials = () => {
    if (newAdminCredentials) {
      navigator.clipboard.writeText(
        `Email: ${newAdminCredentials.email}\nPassword: ${newAdminCredentials.password}\nAccess Key: X9K7-FITBIT-ADMIN-2024`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Management</h1>
          <p className="text-zinc-500">Grant or revoke admin access to users</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Admin</h2>
              <p className="text-sm text-zinc-500">Enter email to grant admin access</p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                If the email is already registered, they will be promoted to admin. Otherwise, a new account will be created.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            {success && !newAdminCredentials && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                {success}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={adding || !email}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {adding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Grant Admin Access
                </>
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {newAdminCredentials && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-lg font-bold text-white">New Admin Credentials</h3>
                </div>
                <button
                  onClick={() => setNewAdminCredentials(null)}
                  className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-zinc-900/50 rounded-xl p-4 font-mono text-sm space-y-2 mb-4">
                <p><span className="text-zinc-500">Email:</span> <span className="text-emerald-400">{newAdminCredentials.email}</span></p>
                <p><span className="text-zinc-500">Password:</span> <span className="text-emerald-400">{newAdminCredentials.password}</span></p>
                <p><span className="text-zinc-500">Access Key:</span> <span className="text-amber-400">X9K7-FITBIT-ADMIN-2024</span></p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyCredentials}
                  className="flex-1 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </button>
              </div>

              <p className="text-xs text-amber-400 mt-4">
                Save these credentials! The password will not be shown again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-bold text-white">Current Admins</h2>
            </div>
            <span className="px-3 py-1 bg-violet-500/15 text-violet-400 text-sm font-medium rounded-full">
              {admins.length} admin{admins.length !== 1 ? 's' : ''}
            </span>
          </div>

          {admins.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">No admins found</div>
          ) : (
            <div className="divide-y divide-zinc-800/30">
              {admins.map((admin, idx) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                      {admin.full_name?.[0]?.toUpperCase() || admin.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{admin.full_name || 'Admin User'}</p>
                      <p className="text-sm text-zinc-500">{admin.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500 hidden sm:block">
                      Added {formatDate(admin.created_at)}
                    </span>
                    
                    {removeConfirm === admin.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRemoveConfirm(null)}
                          className="px-3 py-1.5 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          disabled={removing}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1"
                        >
                          {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveConfirm(admin.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove admin access"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium mb-1">Security Note</p>
              <p className="text-sm text-zinc-400">
                All admins share the same access key: <code className="px-2 py-0.5 bg-zinc-800 rounded text-amber-400 font-mono">X9K7-FITBIT-ADMIN-2024</code>. 
                Removing an admin only revokes their profile-level access; they will still need the access key to attempt login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
