import type { Priority, Task } from "@/types";
import { addDays, dayDiff, todayIn } from "./dates";

export const PRI: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const key = (t: Task) => (t.due_date ? `${t.due_date}T${t.due_time ?? "23:59:59"}` : "9999");
export const byDue = (a: Task, b: Task) => key(a).localeCompare(key(b)) || PRI[a.priority] - PRI[b.priority];
export const isOpen = (t: Task) => t.status === "todo" || t.status === "in_progress";

export function partition(tasks: Task[], tz: string) {
  const today = todayIn(tz), open = tasks.filter(isOpen);
  const overdue = open.filter((t) => t.effective_status === "overdue").sort(byDue);
  const todayTasks = open.filter((t) => t.due_date === today && t.effective_status !== "overdue").sort(byDue);
  const upcoming = open.filter((t) => t.due_date && t.due_date > today).sort(byDue);
  const completed = tasks.filter((t) => t.status === "completed").sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
  const must = [...overdue, ...todayTasks.filter((t) => PRI[t.priority] <= 1)];
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i); return { date: d, count: open.filter((t) => t.due_date === d).length }; });
  return { today, overdue, todayTasks, upcoming, completed, must, week, dayDiff };
}
