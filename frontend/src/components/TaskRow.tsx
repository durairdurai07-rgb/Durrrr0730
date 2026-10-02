import { Check, ListChecks } from "lucide-react";
import { useCompleteTask, useReopenTask } from "@/api/tasks";
import { useAuth } from "@/contexts/auth";
import { useUi } from "@/contexts/ui";
import { countdown, fmtDate, fmtTime } from "@/lib/dates";
import { label, type Task } from "@/types";

const priColor = { critical: "text-crit", high: "text-high", medium: "text-med", low: "text-muted" } as const;

export function TaskRow({ task }: { task: Task }) {
  const { user } = useAuth(), ui = useUi();
  const complete = useCompleteTask(), reopen = useReopenTask();
  const tz = user?.timezone ?? "UTC", done = task.status === "completed";
  const cd = countdown(task, tz), late = task.effective_status === "overdue";
  const subDone = task.subtasks.filter((s) => s.completed).length;
  return (
    <li className="flex items-start gap-3 border-t border-line py-2.5 first:border-t-0">
      <button
        aria-label={done ? `Restore: ${task.title}` : `Complete: ${task.title}`} aria-pressed={done}
        onClick={() => (done ? reopen.mutate(task) : complete.mutate(task.id))}
        className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border-[1.5px] transition ${done ? "border-accent bg-accent text-accenton" : "border-muted hover:border-accent"}`}>
        {done && <Check size={13} strokeWidth={3} />}
      </button>
      <button className="min-w-0 flex-1 text-left" onClick={() => ui.openDetail(task.id)}>
        <div className={`break-words font-medium ${done ? "text-muted line-through" : ""}`}>{task.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-muted">
          <span>{label(task.category)}</span><span aria-hidden>·</span>
          <span className={`font-semibold ${priColor[task.priority]}`}>{label(task.priority)}</span>
          {task.due_date && <><span aria-hidden>·</span><span>{fmtDate(task.due_date, tz)}{task.due_time ? ` ${fmtTime(task.due_time)}` : ""}</span></>}
          {cd && <><span aria-hidden>·</span><span className={late ? "font-semibold text-crit" : ""}>{cd}</span></>}
          {task.subtasks.length > 0 && <><span aria-hidden>·</span><span className="inline-flex items-center gap-1"><ListChecks size={13} />{subDone}/{task.subtasks.length}</span></>}
        </div>
      </button>
    </li>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) { return <ul>{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</ul>; }
