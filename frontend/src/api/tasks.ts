import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Subtask, Task, TaskInput } from "@/types";

export const toInput = (t: Task, over: Partial<TaskInput> = {}): TaskInput => ({
  title: t.title, description: t.description, category: t.category, status: t.status, priority: t.priority,
  due_date: t.due_date, due_time: t.due_time, repeat_rule: t.repeat_rule, ...over,
});

export const useTasks = () =>
  useQuery({ queryKey: ["tasks"], queryFn: () => api<Task[]>("/api/tasks?limit=200"), staleTime: 30_000, refetchInterval: 60_000 });

function useTaskMutation<V, R = unknown>(fn: (v: V) => Promise<R>, ok?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); if (ok) toast(ok); },
  });
}

export const useCreateTask = () => useTaskMutation((b: TaskInput) => api<Task>("/api/tasks", { method: "POST", body: b }), "Task added");
export const useUpdateTask = () => useTaskMutation((v: { id: number; body: TaskInput }) => api<Task>(`/api/tasks/${v.id}`, { method: "PUT", body: v.body }), "Task saved");
export const useDeleteTask = () => useTaskMutation((id: number) => api<void>(`/api/tasks/${id}`, { method: "DELETE" }), "Task deleted");
export const useCompleteTask = () => useTaskMutation((id: number) => api<Task>(`/api/tasks/${id}/complete`, { method: "PATCH" }), "Completed");
export const useReopenTask = () => useTaskMutation((t: Task) => api<Task>(`/api/tasks/${t.id}`, { method: "PUT", body: toInput(t, { status: "todo" }) }), "Restored");
export const useReschedule = () =>
  useTaskMutation((v: { id: number; due_date: string; due_time: string | null }) =>
    api<Task>(`/api/tasks/${v.id}/reschedule`, { method: "PATCH", body: { due_date: v.due_date, due_time: v.due_time } }), "Rescheduled");
export const useAddSubtask = () => useTaskMutation((v: { id: number; title: string }) => api<Subtask>(`/api/tasks/${v.id}/subtasks`, { method: "POST", body: { title: v.title } }));
export const useToggleSubtask = () => useTaskMutation((v: { id: number; sub: number }) => api<Subtask>(`/api/tasks/${v.id}/subtasks/${v.sub}/toggle`, { method: "PATCH" }));
