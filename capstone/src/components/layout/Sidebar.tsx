import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../services/fileProcessor';
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Copy,
  PieChart,
  Trash2,
  Search,
  FileBarChart,
  History,
  Bell,
  Settings,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    files,
    currentUser,
    notifications,
    duplicateGroups
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const quotaBytes = currentUser?.storageQuota || 25 * 1024 * 1024 * 1024;
  const usagePercent = Math.min(Math.round((totalUsedBytes / quotaBytes) * 100), 100);

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const duplicateCount = duplicateGroups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'files', label: 'My Files', icon: FolderOpen, badge: files.length > 0 ? files.length : undefined },
    { id: 'organizer', label: 'Smart Organizer', icon: Sparkles, highlight: true },
    { id: 'duplicates', label: 'Duplicate Finder', icon: Copy, badge: duplicateCount > 0 ? duplicateCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'storage', label: 'Storage Analyzer', icon: PieChart },
    { id: 'cleanup', label: 'Cleanup Assistant', icon: Trash2 },
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart },
    { id: 'history', label: 'Activity History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined, badgeColor: 'bg-red-500' },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200/80 dark:border-slate-800">
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight truncate">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  AutoFile AI
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Organizer & Dups
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-blue-500 animate-pulse' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left font-semibold">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                      item.badgeColor || 'bg-blue-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}

          {/* Admin Dashboard Entry */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 mt-2">
            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition group ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-bold">Admin Console</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold">
                    Admin
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Storage Meter & User Profile at Bottom */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" /> Storage
                </span>
                <span className="text-slate-500 dark:text-slate-400">{usagePercent}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${Math.max(usagePercent, 2)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{formatBytes(totalUsedBytes)} used</span>
                <span>{formatBytes(quotaBytes)} quota</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`${formatBytes(totalUsedBytes)} of ${formatBytes(quotaBytes)}`}>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            </div>
          )}

          {/* User Profile Snippet */}
          {currentUser ? (
            <div
              onClick={() => handleTabClick('profile')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {currentUser.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleTabClick('signin')}
                className="flex-1 py-2 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold text-center hover:bg-blue-100 transition truncate"
              >
                {!isCollapsed ? 'Sign In' : 'Login'}
              </button>
              {!isCollapsed && (
                <button
                  onClick={() => handleTabClick('signup')}
                  className="flex-1 py-2 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold text-center hover:from-blue-700 hover:to-indigo-700 transition truncate shadow-sm"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
