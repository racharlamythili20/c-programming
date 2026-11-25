import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRegisteredUsers, saveRegisteredUser } from '../services/db';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Layers,
  AlertCircle
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { setActiveTab, setCurrentUser, addNotification } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setResetSent(true);
      addNotification('Reset Link Sent', `Password reset instructions sent to ${email}`, 'info');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      const registeredUsers = getRegisteredUsers();
      const existing = registeredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        setErrorMsg('An account with this email address already exists. Please sign in.');
        return;
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: email.trim(),
        fullName: name.trim(),
        role: role,
        plan: 'Free' as const,
        storageQuota: 25 * 1024 * 1024 * 1024, // 25 GB
        createdAt: Date.now()
      };

      saveRegisteredUser(newUser);
      setCurrentUser(newUser);
      addNotification('Account Created', `Welcome to Intelligent File Organizer, ${newUser.fullName}!`, 'success');
      setActiveTab('overview');
    } else {
      // Login
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both your email and password.');
        return;
      }

      const registeredUsers = getRegisteredUsers();
      const found = registeredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (found) {
        setCurrentUser(found);
        addNotification('Signed In', `Welcome back, ${found.fullName}!`, 'success');
        setActiveTab('overview');
      } else {
        // If not registered yet, create their authenticated profile
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: email.trim(),
          fullName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: email.toLowerCase().includes('admin') ? 'admin' as const : 'user' as const,
          plan: 'Pro' as const,
          storageQuota: 50 * 1024 * 1024 * 1024,
          createdAt: Date.now()
        };
        saveRegisteredUser(newUser);
        setCurrentUser(newUser);
        addNotification('Signed In', `Signed in as ${newUser.email}`, 'success');
        setActiveTab('overview');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl glass-card p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Sign in to AutoFile AI' :
             mode === 'register' ? 'Create Your Account' :
             'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' ? 'Enter your credentials to access your personal dashboard' :
             mode === 'register' ? 'Register your account to manage and organize files' :
             'Enter your email to receive a password reset link'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resetSent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Reset Email Dispatched</h4>
            <p className="text-xs text-slate-500">Check your inbox for password restoration instructions.</p>
            <button
              onClick={() => { setResetSent(false); setMode('login'); }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border-transparent focus:outline-none"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode switcher */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setErrorMsg(''); }} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
