import type { Task } from "@/types";

const p = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
export const todayIn = (tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
export const wallNow = (tz: string) => new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
export const addDays = (s: string, n: number) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return fmt(d); };
export const dayDiff = (a: string, b: string) => Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 864e5);

export function fmtTime(t: string | null) {
  if (!t) return "";
  const h = Number(t.slice(0, 2));
  return `${h % 12 || 12}:${t.slice(3, 5)} ${h < 12 ? "AM" : "PM"}`;
}
export function fmtDate(s: string, tz: string) {
  const diff = dayDiff(todayIn(tz), s);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return new Date(s + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function countdown(t: Task, tz: string): string {
  if (!t.due_date || t.status === "completed" || t.status === "cancelled") return "";
  const today = todayIn(tz), diff = dayDiff(today, t.due_date);
  const dayLabel = () => diff === 0 ? "Due today" : diff === 1 ? "Tomorrow" : diff < 7 ? `${diff} days left` : diff < 14 ? "Next week" : `${plural(Math.round(diff / 7), "week")} left`;
  if (!t.due_time) return diff < 0 ? `Overdue by ${plural(-diff, "day")}` : dayLabel();
  const ms = new Date(`${t.due_date}T${t.due_time.slice(0, 8)}`).getTime() - wallNow(tz).getTime();
  if (ms < 0) {
    const h = Math.floor(-ms / 36e5);
    return h < 1 ? "Overdue" : h < 24 ? `Overdue by ${plural(h, "hour")}` : `Overdue by ${plural(Math.floor(h / 24), "day")}`;
  }
  if (diff === 0) { const m = Math.floor(ms / 6e4); return m < 60 ? `${plural(m, "minute")} left` : `${plural(Math.floor(m / 60), "hour")} left`; }
  return dayLabel();
}
