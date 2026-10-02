import { useSearchParams } from "react-router-dom";
import { useTasks } from "@/api/tasks";
import { ErrorBox, PageSkeleton, TaskSection } from "@/components/ui";
import { byDue, PRI } from "@/lib/selectors";
import { CATEGORIES, PRIORITIES, label, type Task } from "@/types";
import { Search, Plus, ClipboardList, Flag, Clock, CheckCircle } from "lucide-react";
import { useUi } from "@/contexts/ui";

const SORTS: Record<string, (a: Task, b: Task) => number> = {
  deadline: byDue, priority: (a, b) => PRI[a.priority] - PRI[b.priority] || byDue(a, b),
  created: (a, b) => b.created_at.localeCompare(a.created_at), alpha: (a, b) => a.title.localeCompare(b.title),
};

export default function Tasks() {
  const [sp, setSp] = useSearchParams(), q = useTasks(), ui = useUi();
  const get = (k: string) => sp.get(k) ?? "";
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); };
  if (q.isLoading) return <PageSkeleton />;
  if (q.isError) return <ErrorBox onRetry={() => q.refetch()} />;
  const term = get("q").toLowerCase();
  
  const allTasks = q.data ?? [];
  const rows = allTasks.filter((t) =>
    (!term || t.title.toLowerCase().includes(term) || (t.description ?? "").toLowerCase().includes(term)) &&
    (!get("category") || t.category === get("category")) && (!get("priority") || t.priority === get("priority")) &&
    (!get("status") || t.effective_status === get("status"))).sort(SORTS[get("sort")] ?? SORTS.deadline);
  
  const sel = (k: string, name: string, opts: string[]) => (
    <select aria-label={name} className="input !bg-[#0B0D17] !border-line h-10 text-sm w-auto cursor-pointer focus:!border-purple-500/50" value={get(k)} onChange={(e) => set(k, e.target.value)}>
      <option value="">{name}</option>{opts.map((o) => <option key={o} value={o}>{label(o)}</option>)}
    </select>
  );

  const StatCard = ({ title, count, icon: Icon, color, bg }: any) => (
    <div className="card flex items-center gap-4 !bg-[#12141F] hover:!bg-[#161825] transition-colors border border-line overflow-hidden relative group p-4">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${bg}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${bg} bg-opacity-10 shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div className="flex flex-col">
        <div className="text-xl font-bold text-white leading-none mb-1">{count}</div>
        <div className="text-xs font-semibold text-muted">{title}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My tasks</h1>
          <p className="text-muted text-[13px] font-medium">Every task in one place.</p>
        </div>
        <button className="btn !bg-gradient-to-r !from-indigo-600 !to-purple-600 !shadow-purple-500/25 px-5 py-2 text-sm" onClick={() => ui.openNew()}><Plus size={16} />Add task</button>
      </div>

      <div className="card !bg-[#0B0D17] !p-2.5 mb-6 flex flex-wrap gap-2 items-center border border-line rounded-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="w-full bg-transparent border-none text-sm text-white placeholder-muted focus:ring-0 pl-9 pr-3 py-1.5 outline-none" placeholder="Search tasks" aria-label="Search tasks" value={get("q")} onChange={(e) => set("q", e.target.value)} />
        </div>
        <div className="w-px h-6 bg-line hidden md:block mx-1"></div>
        {sel("category", "All categories", [...CATEGORIES])}
        <div className="w-px h-6 bg-line hidden md:block mx-1"></div>
        {sel("priority", "All priorities", [...PRIORITIES])}
        <div className="w-px h-6 bg-line hidden md:block mx-1"></div>
        {sel("status", "All statuses", ["todo", "in_progress", "overdue", "completed", "cancelled"])}
        <div className="w-px h-6 bg-line hidden md:block mx-1"></div>
        <select aria-label="Sort by" className="bg-transparent border-none text-sm text-muted focus:ring-0 cursor-pointer outline-none hover:text-white transition-colors py-1.5 px-2" value={get("sort") || "deadline"} onChange={(e) => set("sort", e.target.value)}>
          <option value="deadline" className="bg-[#12141F]">Sort: Deadline</option>
          <option value="priority" className="bg-[#12141F]">Sort: Priority</option>
          <option value="created" className="bg-[#12141F]">Sort: Created</option>
          <option value="alpha" className="bg-[#12141F]">Sort: A–Z</option>
        </select>
      </div>

      <div className="flex-1 mb-8">
        <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          Tasks <span className="text-purple-400 font-semibold">({rows.length})</span>
        </div>
        <div className="card !bg-[#0B0D17] p-1 border border-line rounded-2xl">
          <TaskSection title="" tasks={rows} emptyTitle={allTasks.length ? "No matches" : "No tasks yet"} emptyHint={allTasks.length ? "Try different filters or a different search." : "Press N to add your first task."} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-auto">
        <StatCard title="Total tasks" count={allTasks.length} icon={ClipboardList} color="text-purple-400" bg="bg-purple-500" />
        <StatCard title="High priority" count={allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length} icon={Flag} color="text-orange-500" bg="bg-orange-500" />
        <StatCard title="Due today" count={allTasks.filter(t => t.due_date === new Date().toISOString().split('T')[0] && t.status !== 'completed').length} icon={Clock} color="text-blue-500" bg="bg-blue-500" />
        <StatCard title="Completed" count={allTasks.filter(t => t.status === 'completed').length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500" />
      </div>
    </div>
  );
}
