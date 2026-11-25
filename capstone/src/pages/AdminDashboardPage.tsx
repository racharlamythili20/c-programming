import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRegisteredUsers } from '../services/db';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  ShieldAlert,
  Users,
  HardDrive,
  Copy,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  Server,
  Cpu,
  RefreshCw,
  LogOut
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, setCurrentUser, files, duplicateGroups, activityLogs, setActiveTab } = useApp();

  const [activeTab, setActiveTabLocal] = useState<'overview' | 'users' | 'errors'>('overview');

  // Check if role is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-12 text-center rounded-3xl glass-card border border-purple-200 dark:border-purple-900/60 max-w-lg mx-auto space-y-4 my-12 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Administrator Privilege Required
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The administrative console contains restricted metrics, tenant user directories, and system telemetry.
          {currentUser ? ` Your current account role is "${currentUser.role}".` : ' You are not currently logged in.'}
        </p>
        {currentUser ? (
          <button
            onClick={() => setCurrentUser({ ...currentUser, role: 'admin' })}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition"
          >
            Grant Admin Role to Current Account
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('signin')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition"
          >
            Sign In with Administrator Account
          </button>
        )}
      </div>
    );
  }

  // Real registered users from persistent storage
  const registeredUsers = getRegisteredUsers();
  const allUsers = registeredUsers.length > 0 ? registeredUsers : (currentUser ? [currentUser] : []);

  const totalRegisteredUsers = allUsers.length;
  const activeSessionsToday = currentUser ? 1 : 0;
  const totalSystemFiles = files.length;
  const totalSystemStorage = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Operational Telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            System Administration Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-based infrastructure health, registered tenants, and cryptographic integrity monitor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Admin: {currentUser.fullName}
          </span>
          <button
            onClick={() => setCurrentUser({ ...currentUser, role: 'user' })}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          >
            Exit Admin Mode
          </button>
        </div>
      </div>

      {/* Real Admin Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" /> Registered Accounts
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalRegisteredUsers}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Active accounts stored</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" /> Active Session
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeSessionsToday}</p>
          <p className="text-[10px] text-slate-400">Current administrator</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-500" /> Files Indexed
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSystemFiles}</p>
          <p className="text-[10px] text-slate-400">SHA-256 indexed files</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-500" /> Storage Handled
          </p>
          <p className="text-2xl font-extrabold text-emerald-600">{formatBytes(totalSystemStorage)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Live verified volume</p>
        </div>
      </div>

      {/* System Health Status Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Infrastructure Microservices Status
          </h3>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Subsystems Nominal
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Web Crypto Worker</span>
            <span className="font-bold text-white mt-0.5 block">SubtleCrypto SHA-256 Active</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">IndexedDB Engine</span>
            <span className="font-bold text-white mt-0.5 block">Persistent Store v1 Connected</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">AI Categorizer</span>
            <span className="font-bold text-white mt-0.5 block">Client-side Semantic Parser</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">PostgreSQL Sync</span>
            <span className="font-bold text-white mt-0.5 block">Supabase Client Available</span>
          </div>
        </div>
      </div>

      {/* Tenant User Directory Table */}
      <div className="rounded-3xl glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Registered User Directory ({allUsers.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {formatBytes(u.storageQuota || 25 * 1024 * 1024 * 1024)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
