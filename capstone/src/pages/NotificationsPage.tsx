import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../services/fileProcessor';
import {
  Bell,
  Check,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Inbox
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Notifications Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System alerts regarding scan completions, storage warnings, and organization suggestions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm self-start"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Notification Inbox is Empty</h4>
            <p className="text-xs text-slate-400">You are completely up to date.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl glass-card border transition flex items-start justify-between gap-4 cursor-pointer ${
                n.read
                  ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
                  : 'border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5">
                  {n.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                   n.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                   n.type === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> :
                   <Info className="w-4 h-4 text-blue-500" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    <span className="text-[10px] text-slate-400">{formatDate(n.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Dismiss"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
