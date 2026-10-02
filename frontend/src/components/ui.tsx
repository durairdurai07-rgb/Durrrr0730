import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useUi } from "@/contexts/ui";
import type { Task } from "@/types";
import { TaskList } from "./TaskRow";

export function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return <section className="card mb-4"><h2 className="mb-1 text-[15px] font-semibold">{title}{count !== undefined && <span className="ml-2 font-normal text-muted">{count}</span>}</h2>{children}</section>;
}
export function Empty({ title, hint, action }: { title: string; hint: string; action?: boolean }) {
  const ui = useUi();
  return (
    <div className="px-3 py-7 text-center text-muted">
      <div className="text-base font-semibold text-ink">{title}</div><div>{hint}</div>
      {action && <button className="btn mt-3" onClick={() => ui.openNew()}><Plus size={16} />Add task</button>}
    </div>
  );
}
export function TaskSection({ title, tasks, emptyTitle, emptyHint }: { title: string; tasks: Task[]; emptyTitle: string; emptyHint: string }) {
  return <Section title={title} count={tasks.length || undefined}>{tasks.length ? <TaskList tasks={tasks} /> : <Empty title={emptyTitle} hint={emptyHint} />}</Section>;
}
export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  const ui = useUi();
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{sub && <p className="text-muted">{sub}</p>}</div>
      <button className="btn" onClick={() => ui.openNew()}><Plus size={16} />Add task</button>
    </div>
  );
}
export function PageSkeleton() {
  return <div className="grid gap-3" aria-busy="true" aria-label="Loading"><div className="skel h-8 w-56" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skel h-20" />)}</div><div className="skel h-48" /><div className="skel h-48" /></div>;
}
export function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return <div className="card text-center"><div className="font-semibold">Couldn't load your tasks.</div><div className="mb-3 text-muted">Please try again.</div><button className="btn" onClick={onRetry}>Retry</button></div>;
}
