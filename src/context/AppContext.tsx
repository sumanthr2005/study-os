'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RunningTimer {
  isRunning: boolean;
  mode: 'stopwatch' | 'pomodoro' | 'countdown' | 'custom';
  secondsRemaining: number;
  totalDurationSeconds: number;
  subject: string;
  playlistId?: string;
  playlistTitle?: string;
  playlistVideoId?: string;
  playlistVideoTitle?: string;
  taskId?: string;
  taskTitle?: string;
  isDeepWork: boolean;
  notes: string;
  startTimestamp?: number;
}

interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;
  userSummary: any;
  refreshUserSummary: () => Promise<void>;
  timer: RunningTimer;
  startTimer: (config: Partial<RunningTimer>) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  saveStudySession: () => Promise<void>;
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  quickAddWater: (amountMl: number) => Promise<void>;
}

const defaultTimer: RunningTimer = {
  isRunning: false,
  mode: 'pomodoro',
  secondsRemaining: 25 * 60,
  totalDurationSeconds: 25 * 60,
  subject: 'DSA',
  isDeepWork: true,
  notes: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userSummary, setUserSummary] = useState<any>(null);
  const [timer, setTimer] = useState<RunningTimer>(defaultTimer);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load theme & persistent timer from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('study_os_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    const savedTimer = localStorage.getItem('study_os_timer');
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        setTimer(parsed);
      } catch (e) {
        console.error('Failed to parse timer state', e);
      }
    }

    refreshUserSummary();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('study_os_theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const showToast = (title: string, message?: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshUserSummary = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserSummary(data);
      }
    } catch (e) {
      console.error('Failed to fetch user summary', e);
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (!prev.isRunning) return prev;

          if (prev.mode === 'stopwatch') {
            const next = {
              ...prev,
              secondsRemaining: prev.secondsRemaining + 1,
              totalDurationSeconds: prev.totalDurationSeconds + 1,
            };
            localStorage.setItem('study_os_timer', JSON.stringify(next));
            return next;
          } else {
            // countdown / pomodoro
            if (prev.secondsRemaining <= 1) {
              // Timer Finished!
              showToast('Session Complete! 🎉', `Great work studying ${prev.subject}! Save your session.`, 'success');
              const next = {
                ...prev,
                isRunning: false,
                secondsRemaining: 0,
              };
              localStorage.setItem('study_os_timer', JSON.stringify(next));
              return next;
            }
            const next = {
              ...prev,
              secondsRemaining: prev.secondsRemaining - 1,
            };
            localStorage.setItem('study_os_timer', JSON.stringify(next));
            return next;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.mode]);

  const startTimer = (config: Partial<RunningTimer>) => {
    const updated: RunningTimer = {
      ...timer,
      ...config,
      isRunning: true,
      startTimestamp: Date.now(),
    };
    setTimer(updated);
    localStorage.setItem('study_os_timer', JSON.stringify(updated));
    showToast('Timer Started', `Tracking ${updated.subject} (${updated.mode})`, 'info');
  };

  const pauseTimer = () => {
    setTimer(prev => {
      const updated = { ...prev, isRunning: false };
      localStorage.setItem('study_os_timer', JSON.stringify(updated));
      return updated;
    });
  };

  const resumeTimer = () => {
    setTimer(prev => {
      const updated = { ...prev, isRunning: true };
      localStorage.setItem('study_os_timer', JSON.stringify(updated));
      return updated;
    });
  };

  const resetTimer = () => {
    const reset = {
      ...defaultTimer,
      subject: timer.subject,
      mode: timer.mode,
      secondsRemaining: timer.mode === 'pomodoro' ? 25 * 60 : 0,
      totalDurationSeconds: timer.mode === 'pomodoro' ? 25 * 60 : 0,
      isRunning: false,
    };
    setTimer(reset);
    localStorage.setItem('study_os_timer', JSON.stringify(reset));
  };

  const saveStudySession = async () => {
    const duration = timer.mode === 'stopwatch' 
      ? timer.secondsRemaining 
      : timer.totalDurationSeconds - timer.secondsRemaining;

    if (duration < 10) {
      showToast('Timer too short', 'Sessions under 10 seconds are not saved.', 'warning');
      resetTimer();
      return;
    }

    try {
      const res = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: timer.subject,
          playlistId: timer.playlistId,
          playlistVideoId: timer.playlistVideoId,
          taskId: timer.taskId,
          mode: timer.mode,
          durationSeconds: duration,
          isDeepWork: timer.isDeepWork,
          notes: timer.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Study Session Saved! 🚀', `Logged ${Math.round(duration / 60)} mins. +${data.xpEarned} XP!`, 'success');
        resetTimer();
        await refreshUserSummary();
      } else {
        showToast('Save Failed', 'Could not record study session.', 'error');
      }
    } catch (e: any) {
      showToast('Network Error', e.message, 'error');
    }
  };

  const quickAddWater = async (amountMl: number) => {
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Hydration Logged +${amountMl}ml 💧`, `Today's total: ${(data.totalDrankMl / 1000).toFixed(1)}L`, 'success');
        await refreshUserSummary();
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        userSummary,
        refreshUserSummary,
        timer,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        saveStudySession,
        toasts,
        showToast,
        removeToast,
        quickAddWater,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
