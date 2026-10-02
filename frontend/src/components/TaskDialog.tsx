import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "./Modal";
import { useCreateTask, useUpdateTask, toInput } from "@/api/tasks";
import { CATEGORIES, PRIORITIES, STATUSES, label, type Category, type Task } from "@/types";

const schema = z.object({
  title: z.string().trim().min(1, "Add a title so you can find this task later.").max(200),
  description: z.string().max(5000).optional(),
  category: z.enum(CATEGORIES), priority: z.enum(PRIORITIES), status: z.enum(STATUSES),
  due_date: z.string().optional(), due_time: z.string().optional(),
}).refine((v) => !v.due_time || !!v.due_date, { path: ["due_time"], message: "Pick a date for that time, or clear the time." });
type Form = z.infer<typeof schema>;

export function TaskDialog({ task, defaults, onClose }: { task?: Task; defaults?: { category?: Category; due_date?: string }; onClose: () => void }) {
  const create = useCreateTask(), update = useUpdateTask();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "", description: task?.description ?? "", category: task?.category ?? defaults?.category ?? "homework",
      priority: task?.priority ?? "medium", status: task?.status ?? "todo", due_date: task?.due_date ?? defaults?.due_date ?? "", due_time: task?.due_time?.slice(0, 5) ?? "",
    },
  });
  const busy = create.isPending || update.isPending;
  const submit = handleSubmit(async (v) => {
    const body = {
      title: v.title, description: v.description?.trim() || null, category: v.category, priority: v.priority, status: v.status,
      due_date: v.due_date || null, due_time: v.due_time ? `${v.due_time}:00` : null, repeat_rule: task?.repeat_rule ?? null,
    };
    try {
      if (task) await update.mutateAsync({ id: task.id, body: { ...toInput(task), ...body } }); else await create.mutateAsync(body);
      onClose();
    } catch { /* global error toast already shown */ }
  });
  const err = (k: keyof Form) => errors[k] && <span className="text-crit">{errors[k]?.message}</span>;
  return (
    <Modal title={task ? "Edit task" : "Add task"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3" noValidate>
        <label className="label">Title<input className="input" maxLength={200} {...register("title")} />{err("title")}</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="label">Category<select className="input" {...register("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></label>
          <label className="label">Priority<select className="input" {...register("priority")}>{PRIORITIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="label">Date<input type="date" className="input" {...register("due_date")} /></label>
          <label className="label">Time<input type="time" className="input" {...register("due_time")} />{err("due_time")}</label>
        </div>
        {task && <label className="label">Status<select className="input" {...register("status")}>{STATUSES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></label>}
        <label className="label">Notes<textarea rows={3} className="input" {...register("description")} /></label>
        <div className="mt-1 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : task ? "Save changes" : "Add task"}</button>
        </div>
      </form>
    </Modal>
  );
}
