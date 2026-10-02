export const CATEGORIES = ["homework", "assignment", "study", "project", "hackathon", "event", "exam", "test", "competition", "personal", "other"] as const;
export const PRIORITIES = ["critical", "high", "medium", "low"] as const;
export const STATUSES = ["todo", "in_progress", "completed", "cancelled"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface User { id: number; name: string; email: string; timezone: string; avatar_url: string | null }
export interface Subtask { id: number; title: string; completed: boolean; completed_at: string | null }
export interface Task {
  id: number; title: string; description: string | null; category: Category; status: Status;
  effective_status: Status | "overdue"; priority: Priority; due_date: string | null; due_time: string | null;
  repeat_rule: string | null; created_at: string; updated_at: string; completed_at: string | null; subtasks: Subtask[];
}
export interface TaskInput {
  title: string; description: string | null; category: Category; status: Status; priority: Priority;
  due_date: string | null; due_time: string | null; repeat_rule: string | null;
}
export const label = (s: string) => (s === "in_progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1));
