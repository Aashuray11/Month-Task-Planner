import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { parseISO } from '../utils/dateUtils';

const TaskContext: any = createContext(null as any);

const STORAGE_KEY = 'month-planner-tasks-v1';

export function TaskProvider({ children }: { children: any }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      // validate
      return parsed.filter(t => t && t.id && t.name && t.start && t.end);
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState({
    categories: new Set(['todo', 'inprogress', 'review', 'completed']),
    timeWindowWeeks: 0,
    search: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  function addTask(t: any) {
    const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setTasks(prev => [...prev, { ...t, id }]);
  }

  function updateTask(id: any, patch: any) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeTask(id: any) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const value = useMemo(
    () => ({ tasks, addTask, updateTask, removeTask, filters, setFilters }),
    [tasks, filters]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

export function taskOverlapsWindow(task: any, startISO: string, endISO: string) {
  const s = parseISO(task.start);
  const e = parseISO(task.end);
  const ws = parseISO(startISO);
  const we = parseISO(endISO);
  return e >= ws && s <= we;
}
