"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2, Check } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = "agent-town:notifications";
const MAX_NOTIFICATIONS = 50;

// ── Notification Provider ──────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));

    // Show browser notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new BrowserNotification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

// ── Notification Center Panel ──────────────────────────────────────────────

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (!isOpen) return null;

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === "all" ? "bg-white text-black" : "bg-slate-700 text-slate-300"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === "unread" ? "bg-white text-black" : "bg-slate-700 text-slate-300"
            }`}
          >
            Unread ({unreadCount})
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="ml-auto px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredNotifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors ${
                      !notification.read ? "bg-slate-800/30" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${notification.read ? "text-slate-300" : "text-white"}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        {notification.actionUrl && notification.actionLabel && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
                          >
                            {notification.actionLabel} →
                          </a>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full absolute top-4 right-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─-- Toast Notification Component ─────────────────────────────────────────

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
}

export function ToastNotification({ notification, onClose }: ToastNotificationProps) {
  const config = TYPE_CONFIG[notification.type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg animate-slide-in ${
        notification.type === "error" ? "border-red-500/50" : ""
      }`}
    >
      <div className={`p-1 ${config.color}`}>{config.icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
