import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  User,
  Shield,
  Key,
  HardDrive,
  Sparkles,
  Check,
  CheckCircle2,
  Mail,
  ShieldAlert,
  ArrowRight,
  LogOut,
  LogIn
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, logout, files, setActiveTab, addNotification } = useApp();

  const [nameInput, setNameInput] = useState(currentUser?.fullName || '');
  const [emailInput, setEmailInput] = useState(currentUser?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-12 text-center rounded-3xl glass-card border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Not Signed In
        </h2>
        <p className="text-xs text-slate-500">
          Sign in or create an account to view and manage your profile and storage quota.
        </p>
        <button
          onClick={() => setActiveTab('auth')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 mx-auto"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const quotaBytes = currentUser.storageQuota || 25 * 1024 * 1024 * 1024;
  const usagePercent = Math.min(Math.round((totalUsedBytes / quotaBytes) * 100), 100);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      fullName: nameInput.trim(),
      email: emailInput.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    addNotification('Profile Updated', 'Profile changes have been saved.', 'success');
  };

  const toggleRole = () => {
    const newRole = currentUser.role === 'admin' ? 'user' : 'admin';
    setCurrentUser({ ...currentUser, role: newRole });
    addNotification('Role Switched', `Active session role is now "${newRole.toUpperCase()}".`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <User className="w-3.5 h-3.5" />
            <span>Account & Security Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your credentials, tier quota, and security privileges.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 transition flex items-center gap-1.5 self-start"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl glass-card flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 flex-shrink-0">
          {currentUser.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currentUser.fullName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {currentUser.plan} Tier
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
              currentUser.role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <p className="text-[11px] text-slate-400">Member since {formatDate(currentUser.createdAt)}</p>
        </div>

        {/* Switch Role Button */}
        <button
          onClick={toggleRole}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
        >
          Switch to {currentUser.role === 'admin' ? 'Regular User' : 'Admin'} Mode
        </button>
      </div>

      {/* Storage Quota Card */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-500" />
            Storage Allowance
          </h3>
          <span className="text-xs font-bold text-blue-600">{usagePercent}% Consumed</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${Math.max(usagePercent, 2)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatBytes(totalUsedBytes)} used of {formatBytes(quotaBytes)}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatBytes(quotaBytes - totalUsedBytes)} available</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white border-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            <span>{isSaved ? 'Saved!' : 'Update Profile'}</span>
          </button>
        </div>
      </form>

      {/* Admin Quick Link if Admin */}
      {currentUser.role === 'admin' && (
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">Administrator Console Access Enabled</h4>
              <p className="text-xs text-purple-700 dark:text-purple-400">Access system health, user quotas, and global logs.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md transition flex items-center gap-1.5"
          >
            <span>Open Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
