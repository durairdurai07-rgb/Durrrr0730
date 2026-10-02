import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import type { Subtask, Task, TaskInput } from "@/types";

const STORAGE_KEY = "myday_local_tasks";

const getLocalTasks = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Helper for effective status
const calcEffectiveStatus = (status: Task["status"], due_date: string | null): Task["effective_status"] => {
  if (status === "completed" || status === "cancelled") return status;
  if (due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = due_date.split("-").map(Number);
    const due = new Date(y, m - 1, d);
    if (due < today) return "overdue";
  }
  return status;
};

export const toInput = (t: Task, over: Partial<TaskInput> = {}): TaskInput => ({
  title: t.title, description: t.description, category: t.category, status: t.status, priority: t.priority,
  due_date: t.due_date, due_time: t.due_time, repeat_rule: t.repeat_rule, ...over,
});

export const useTasks = () =>
  useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 300));
      const tasks = getLocalTasks();
      // recalculate effective statuses just in case time passed
      return tasks.map(t => ({ ...t, effective_status: calcEffectiveStatus(t.status, t.due_date) }));
    }
  });

function useLocalMutation<V, R = unknown>(fn: (v: V) => Promise<R>, ok?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["tasks"] }); 
      if (ok) toast(ok); 
    },
  });
}

export const useCreateTask = () => useLocalMutation(async (b: TaskInput) => {
  const tasks = getLocalTasks();
  const now = new Date().toISOString();
  const newTask: Task = {
    ...b,
    id: generateId(),
    effective_status: calcEffectiveStatus(b.status, b.due_date),
    created_at: now,
    updated_at: now,
    completed_at: b.status === "completed" ? now : null,
    subtasks: []
  };
  tasks.push(newTask);
  saveLocalTasks(tasks);
  return newTask;
}, "Task added");

export const useUpdateTask = () => useLocalMutation(async (v: { id: number; body: TaskInput }) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === v.id);
  if (index === -1) throw new Error("Task not found");
  
  const now = new Date().toISOString();
  const prev = tasks[index];
  const updated: Task = {
    ...prev,
    ...v.body,
    effective_status: calcEffectiveStatus(v.body.status, v.body.due_date),
    updated_at: now,
    completed_at: v.body.status === "completed" && prev.status !== "completed" ? now : 
                  (v.body.status !== "completed" ? null : prev.completed_at)
  };
  tasks[index] = updated;
  saveLocalTasks(tasks);
  return updated;
}, "Task saved");

export const useDeleteTask = () => useLocalMutation(async (id: number) => {
  const tasks = getLocalTasks();
  saveLocalTasks(tasks.filter(t => t.id !== id));
}, "Task deleted");

export const useCompleteTask = () => useLocalMutation(async (id: number) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Task not found");
  
  const now = new Date().toISOString();
  tasks[index] = {
    ...tasks[index],
    status: "completed",
    effective_status: "completed",
    completed_at: now,
    updated_at: now
  };
  saveLocalTasks(tasks);
  return tasks[index];
}, "Completed");

export const useReopenTask = () => useLocalMutation(async (t: Task) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(x => x.id === t.id);
  if (index === -1) throw new Error("Task not found");
  
  const now = new Date().toISOString();
  tasks[index] = {
    ...tasks[index],
    status: "todo",
    effective_status: calcEffectiveStatus("todo", tasks[index].due_date),
    completed_at: null,
    updated_at: now
  };
  saveLocalTasks(tasks);
  return tasks[index];
}, "Restored");

export const useReschedule = () => useLocalMutation(async (v: { id: number; due_date: string; due_time: string | null }) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === v.id);
  if (index === -1) throw new Error("Task not found");
  
  tasks[index] = {
    ...tasks[index],
    due_date: v.due_date,
    due_time: v.due_time,
    effective_status: calcEffectiveStatus(tasks[index].status, v.due_date),
    updated_at: new Date().toISOString()
  };
  saveLocalTasks(tasks);
  return tasks[index];
}, "Rescheduled");

export const useAddSubtask = () => useLocalMutation(async (v: { id: number; title: string }) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === v.id);
  if (index === -1) throw new Error("Task not found");
  
  const subtask: Subtask = {
    id: generateId(),
    title: v.title,
    completed: false,
    completed_at: null
  };
  tasks[index].subtasks.push(subtask);
  tasks[index].updated_at = new Date().toISOString();
  saveLocalTasks(tasks);
  return subtask;
});

export const useToggleSubtask = () => useLocalMutation(async (v: { id: number; sub: number }) => {
  const tasks = getLocalTasks();
  const index = tasks.findIndex(t => t.id === v.id);
  if (index === -1) throw new Error("Task not found");
  
  const subIndex = tasks[index].subtasks.findIndex(s => s.id === v.sub);
  if (subIndex === -1) throw new Error("Subtask not found");
  
  const sub = tasks[index].subtasks[subIndex];
  sub.completed = !sub.completed;
  sub.completed_at = sub.completed ? new Date().toISOString() : null;
  tasks[index].updated_at = new Date().toISOString();
  saveLocalTasks(tasks);
  return sub;
});
