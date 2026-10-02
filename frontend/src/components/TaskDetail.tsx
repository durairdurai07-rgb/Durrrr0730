import { useState } from "react";
import { CalendarClock, Check, Copy, Pencil, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { toInput, useAddSubtask, useCompleteTask, useCreateTask, useReopenTask, useReschedule, useTasks, useToggleSubtask } from "@/api/tasks";
import { useAuth } from "@/contexts/auth";
import { useUi } from "@/contexts/ui";
import { addDays, countdown, fmtDate, fmtTime, todayIn } from "@/lib/dates";
import { label } from "@/types";

export function TaskDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const { user } = useAuth(), ui = useUi(), tasks = useTasks();
  const complete = useCompleteTask(), reopen = useReopenTask(), resched = useReschedule(), create = useCreateTask();
  const addSub = useAddSubtask(), toggle = useToggleSubtask();
  const [sub, setSub] = useState("");
  const tz = user?.timezone ?? "UTC", task = tasks.data?.find((t) => t.id === id);
  if (!task) return <Modal side title="Task" onClose={onClose}><p className="text-muted">This task is no longer available.</p></Modal>;
  const done = task.status === "completed", total = task.subtasks.length, sd = task.subtasks.filter((s) => s.completed).length;
  const cd = countdown(task, tz), today = todayIn(tz);
  const snooze = (days: number) => resched.mutate({ id: task.id, due_date: addDays(today, days), due_time: task.due_time });
  const row = (k: string, v: string) => <div className="flex justify-between gap-4 border-t border-line py-2 first:border-t-0"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>;
  const when = (s: string | null) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: tz }) : "");
  return (
    <Modal side title="Task details" onClose={onClose}>
      <h3 className={`text-lg font-semibold ${done ? "text-muted line-through" : ""}`}>{task.title}</h3>
      {cd && <p className={task.effective_status === "overdue" ? "font-semibold text-crit" : "text-muted"}>{cd}</p>}
      {task.description && <p className="mt-2 whitespace-pre-wrap">{task.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {done ? <button className="btn" onClick={() => reopen.mutate(task)}>Restore</button> : <button className="btn" onClick={() => complete.mutate(task.id)}><Check size={16} />Complete</button>}
        <button className="btn-ghost" onClick={() => ui.openEdit(task)}><Pencil size={15} />Edit</button>
        <button className="btn-ghost" disabled={create.isPending} onClick={() => create.mutate({ ...toInput(task, { status: "todo" }), title: `${task.title} (copy)` })}><Copy size={15} />Duplicate</button>
        <button className="btn-ghost text-crit" onClick={() => ui.confirmDelete(task, onClose)}><Trash2 size={15} />Delete</button>
      </div>
      {!done && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-muted"><CalendarClock size={15} />Move to</span>
          <button className="btn-ghost py-1" onClick={() => snooze(0)} disabled={task.due_date === today}>Today</button>
          <button className="btn-ghost py-1" onClick={() => snooze(1)}>Tomorrow</button>
          <button className="btn-ghost py-1" onClick={() => snooze(7)}>Next week</button>
          <input type="date" aria-label="Pick a date" className="input w-auto py-1" value={task.due_date ?? ""} onChange={(e) => e.target.value && resched.mutate({ id: task.id, due_date: e.target.value, due_time: task.due_time })} />
        </div>
      )}
      <h4 className="mb-1 mt-6 font-semibold">Subtasks{total > 0 && <span className="ml-2 font-normal text-muted">{sd} / {total} completed</span>}</h4>
      {total > 0 && <div className="mb-2 h-2 overflow-hidden rounded bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={sd}><div className="h-full bg-accent transition-all" style={{ width: `${(sd / total) * 100}%` }} /></div>}
      <ul>{task.subtasks.map((s) => (
        <li key={s.id}><label className="flex cursor-pointer items-center gap-2 py-1.5">
          <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={s.completed} onChange={() => toggle.mutate({ id: task.id, sub: s.id })} />
          <span className={s.completed ? "text-muted line-through" : ""}>{s.title}</span></label></li>
      ))}</ul>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = sub.trim(); if (t) addSub.mutate({ id: task.id, title: t }, { onSuccess: () => setSub("") }); }}>
        <input className="input" placeholder="Add a subtask" aria-label="New subtask" maxLength={200} value={sub} onChange={(e) => setSub(e.target.value)} />
        <button className="btn-ghost" type="submit" disabled={addSub.isPending}>Add</button>
      </form>
      <dl className="mt-6">
        {row("Category", label(task.category))}{row("Status", label(task.effective_status))}{row("Priority", label(task.priority))}
        {task.due_date && row("Due", `${fmtDate(task.due_date, tz)}${task.due_time ? ` · ${fmtTime(task.due_time)}` : ""}`)}
        {row("Created", when(task.created_at))}{row("Updated", when(task.updated_at))}{task.completed_at && row("Completed", when(task.completed_at))}
      </dl>
    </Modal>
  );
}
