'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { TaskItem } from '@/types';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, Trash2, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

export function TaskBoard({
  initialTasks = [],
  onTasksChange,
}: {
  initialTasks: TaskItem[];
  onTasksChange?: () => void;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    Array.isArray(initialTasks)
      ? initialTasks.filter((t): t is TaskItem => Boolean(t && typeof t === 'object' && t.id && t.status))
      : []
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if initialTasks changes from server/props
  useEffect(() => {
    if (Array.isArray(initialTasks)) {
      setTasks(initialTasks.filter((t): t is TaskItem => Boolean(t && typeof t === 'object' && t.id && t.status)));
    }
  }, [initialTasks]);

  // Quick Add State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(30);

  const handleToggleTask = async (task: TaskItem) => {
    if (!task || !task.id) return;
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      setErrorMessage(null);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTasks(prev =>
          prev.map(t => (t && t.id === task.id ? { ...t, status: nextStatus } : t))
        );
        onTasksChange?.();
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || `Failed to update task status (HTTP ${res.status})`);
      }
    } catch (e: any) {
      console.error('Error updating task:', e);
      setErrorMessage(e?.message || 'Network error updating task status');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please enter a task title');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          category: newCategory,
          priority: newPriority,
          estimatedMinutes: newEstimatedMinutes,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to create task (HTTP ${res.status})`);
      }

      // Robustly extract task from response (supports both { ...task, task } and direct task)
      const newTask: TaskItem | undefined =
        data?.task && data.task.id && data.task.status
          ? (data.task as TaskItem)
          : data?.id && data?.status
          ? (data as TaskItem)
          : undefined;

      if (!newTask) {
        throw new Error('Server returned an invalid task response without status or ID.');
      }

      setTasks(prev => [newTask, ...prev.filter(t => t && t.id !== newTask.id)]);
      setNewTitle('');
      onTasksChange?.();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setErrorMessage(err?.message || 'Failed to create task. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!id) return;
    try {
      setErrorMessage(null);
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t && t.id !== id));
        onTasksChange?.();
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || `Failed to delete task (HTTP ${res.status})`);
      }
    } catch (e: any) {
      console.error('Error deleting task:', e);
      setErrorMessage(e?.message || 'Network error deleting task');
    }
  };

  // Safe defensive filtering — guarantees all items are valid objects with status
  const validTasks = (Array.isArray(tasks) ? tasks : []).filter(
    (t): t is TaskItem => Boolean(t && typeof t === 'object' && t.id && typeof t.status === 'string')
  );

  const filteredTasks = validTasks.filter(t => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 p-1 rounded transition-colors"
            title="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick Add Form */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-950/15 via-[#0c1220]/80 to-[#0c1220]/80">
        <form onSubmit={handleCreateTask} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Add new high-leverage task (e.g. Implement Dijkstra's algorithm, Review DBMS normal forms)..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 min-w-[260px] rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
          />

          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 light:bg-slate-50 light:text-slate-900"
          >
            <option value="Study">Study</option>
            <option value="Coding">Coding</option>
            <option value="Revision">Revision</option>
            <option value="Placement">Placement</option>
            <option value="Project">Project</option>
          </select>

          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as any)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 light:bg-slate-50 light:text-slate-900"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <input
            type="number"
            min={5}
            max={360}
            step={5}
            title="Estimated minutes"
            value={newEstimatedMinutes}
            onChange={e => setNewEstimatedMinutes(Number(e.target.value))}
            className="w-20 rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-xs text-center text-slate-200 light:bg-slate-50 light:text-slate-900"
          />

          <Button type="submit" variant="primary" size="sm" icon={Plus} disabled={isSubmitting}>
            Add Task
          </Button>
        </form>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Category:</span>
          {['ALL', 'Study', 'Coding', 'Revision', 'Placement', 'Project'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-slate-400">
          Showing <strong className="text-slate-200">{filteredTasks.length}</strong> tasks (
          <strong className="text-indigo-400">{todoTasks.length}</strong> pending)
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {todoTasks.map(task => {
          const priorityColor =
            task.priority === 'URGENT'
              ? 'danger'
              : task.priority === 'HIGH'
              ? 'warning'
              : 'info';

          return (
            <Card
              key={task.id}
              className="flex items-center justify-between gap-4 p-4 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleTask(task)}
                  className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                >
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 light:text-slate-900 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {task.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {task.estimatedMinutes}m est.
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.deadline), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={priorityColor as any}>{task.priority}</Badge>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}

        {/* Completed Tasks section */}
        {completedTasks.length > 0 && (
          <div className="pt-4 mt-6 border-t border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Completed Tasks ({completedTasks.length})
            </h5>
            <div className="space-y-2 opacity-65">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleTask(task)} className="text-emerald-400 p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <span className="line-through text-slate-400">{task.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Done</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
