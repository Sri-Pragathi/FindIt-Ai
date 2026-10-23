import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';

export type AppView =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'dashboard'
  | 'browse'
  | 'report_lost'
  | 'report_found'
  | 'my_reports'
  | 'notifications'
  | 'profile'
  | 'admin'
  | 'item_detail'
  | 'match_review'
  | 'claim_detail';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  availableUsers: User[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  navigate: (view: AppView, params?: { itemId?: string; itemType?: 'lost' | 'found'; matchId?: string; claimId?: string }) => void;
  selectedItemId: string | null;
  selectedItemType: 'lost' | 'found' | null;
  selectedMatchId: string | null;
  selectedClaimId: string | null;
  loginUser: (user: User, token: string) => void;
  logout: () => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('findit_user');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error reading stored user:', err);
      }
    }
    return null;
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'lost' | 'found' | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load available users on startup
  useEffect(() => {
    api.getUsers()
      .then((users) => {
        setAvailableUsers(users);
        // If a stored session exists, verify it still exists in the user list
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('findit_token');
          const savedUserRaw = localStorage.getItem('findit_user');
          if (savedToken && savedUserRaw) {
            try {
              const parsed = JSON.parse(savedUserRaw);
              const found = users.find((u) => u.id === parsed.id);
              if (found) {
                setCurrentUser(found);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
      })
      .catch((err) => {
        console.warn('API get users fallback:', err);
      });
  }, []);

  const loginUser = useCallback((user: User, token: string) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('findit_user', JSON.stringify(user));
      localStorage.setItem('findit_token', token);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('findit_user');
      localStorage.removeItem('findit_token');
    }
    setCurrentView('landing');
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message: 'Signed out of campus session.', type: 'info' }]);
  }, []);

  // Refresh notifications when user changes
  const refreshNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const list = await api.getNotifications(currentUser.id);
      setNotifications(list);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const navigate = useCallback(
    (view: AppView, params?: { itemId?: string; itemType?: 'lost' | 'found'; matchId?: string; claimId?: string }) => {
      if (params?.itemId) setSelectedItemId(params.itemId);
      if (params?.itemType) setSelectedItemType(params.itemType);
      if (params?.matchId) setSelectedMatchId(params.matchId);
      if (params?.claimId) setSelectedClaimId(params.claimId);
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!currentUser) return;
    try {
      await api.markAllNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  }, [currentUser, showToast]);

  const switchUser = useCallback(
    async (userId: string) => {
      const user = availableUsers.find((u) => u.id === userId);
      if (user) {
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('findit_user', JSON.stringify(user));
          localStorage.setItem('findit_token', `tok_${user.id}`);
        }
        showToast(`Switched persona to ${user.name} (${user.role.toUpperCase()})`, 'info');
      }
    },
    [availableUsers, showToast]
  );

  const resetDemoData = useCallback(async () => {
    try {
      await api.resetDemo();
      const users = await api.getUsers();
      setAvailableUsers(users);
      const student = users.find((u) => u.id === 'usr_student_alex') || users[0];
      setCurrentUser(student);
      if (typeof window !== 'undefined') {
        localStorage.setItem('findit_user', JSON.stringify(student));
        localStorage.setItem('findit_token', `tok_${student.id}`);
      }
      await refreshNotifications();
      navigate('landing');
      showToast('Demo environment reset to initial state with sample data', 'success');
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`, 'error');
    }
  }, [navigate, refreshNotifications, showToast]);

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginUser,
        logout,
        availableUsers,
        currentView,
        setCurrentView,
        navigate,
        selectedItemId,
        selectedItemType,
        selectedMatchId,
        selectedClaimId,
        notifications,
        unreadNotificationCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        switchUser,
        resetDemoData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
