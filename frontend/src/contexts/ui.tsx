import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { TaskDetail } from "@/components/TaskDetail";
import { TaskDialog } from "@/components/TaskDialog";
import { useDeleteTask } from "@/api/tasks";
import type { Category, Task } from "@/types";

interface Ui {
  openNew: (d?: { category?: Category; due_date?: string }) => void;
  openEdit: (t: Task) => void;
  openDetail: (id: number) => void;
  confirmDelete: (t: Task, after?: () => void) => void;
}
const Ctx = createContext<Ui | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [newDef, setNewDef] = useState<{ category?: Category; due_date?: string } | null>(null);
  const [edit, setEdit] = useState<Task | null>(null);
  const [detail, setDetail] = useState<number | null>(null);
  const [del, setDel] = useState<{ task: Task; after?: () => void } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const remove = useDeleteTask();

  useEffect(() => {
    const on = (e: Event) => {
      const id = Date.now() + Math.random(), text = (e as CustomEvent<string>).detail;
      setToasts((t) => [...t, { id, text }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
    };
    window.addEventListener("myday:toast", on);
    return () => window.removeEventListener("myday:toast", on);
  }, []);

  const value = useMemo<Ui>(() => ({
    openNew: (d) => setNewDef(d ?? {}), openEdit: setEdit, openDetail: setDetail,
    confirmDelete: (task, after) => setDel({ task, after }),
  }), []);
  const closeNew = useCallback(() => setNewDef(null), []);
  const closeEdit = useCallback(() => setEdit(null), []);
  const closeDetail = useCallback(() => setDetail(null), []);
  const closeDel = useCallback(() => setDel(null), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      {detail !== null && <TaskDetail id={detail} onClose={closeDetail} />}
      {newDef && <TaskDialog defaults={newDef} onClose={closeNew} />}
      {edit && <TaskDialog task={edit} onClose={closeEdit} />}
      {del && (
        <Modal title="Delete task?" onClose={closeDel}>
          <p className="mb-4">“{del.task.title}” will be deleted. This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={closeDel}>Cancel</button>
            <button className="btn-danger" disabled={remove.isPending} data-autofocus onClick={async () => { try { await remove.mutateAsync(del.task.id); del.after?.(); closeDel(); } catch { /* toast shown */ } }}>Delete task</button>
          </div>
        </Modal>
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 md:bottom-6" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="pop rounded-lg bg-ink px-3.5 py-2 text-[13px] text-bg shadow-lg">{t.text}</div>)}
      </div>
    </Ctx.Provider>
  );
}
export function useUi() { const c = useContext(Ctx); if (!c) throw new Error("useUi outside UiProvider"); return c; }
