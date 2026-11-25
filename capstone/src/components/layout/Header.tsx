import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Upload,
  FolderPlus,
  Sparkles,
  Sun,
  Moon,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Database,
  Check
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    uploadFiles,
    currentUser,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    isScanning,
    scanProgress,
    scanStatusText,
    addNotification
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      setActiveTab('search');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
      {/* Left Area: Mobile Menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Search files by name, type, SHA-256 hash, or category... (Press Enter)"
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition shadow-inner"
          />
        </form>
      </div>

      {/* Hidden file & folder inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        className="hidden"
      />

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Scanning Indicator Bar */}
        {isScanning && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="truncate max-w-[150px]">{scanStatusText || 'Analyzing files...'}</span>
            <span className="font-bold">{scanProgress}%</span>
          </div>
        )}

        {/* Upload Folder Button */}
        <button
          onClick={() => folderInputRef.current?.click()}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200/60 dark:border-slate-700"
          title="Scan & organize an entire folder structure"
        >
          <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
          <span>Folder</span>
        </button>

        {/* Upload Files Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        {/* Auth / Profile status button */}
        {currentUser ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-semibold text-slate-700 dark:text-slate-200"
            title="User Profile"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline-block truncate max-w-[100px]">{currentUser.fullName}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('signin')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        n.read
                          ? 'bg-slate-50/50 dark:bg-slate-950/30 border-transparent opacity-75'
                          : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="pt-0.5">
                          {n.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                           n.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                           n.type === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> :
                           <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
