import { useState } from "react";
import { Trash2, CheckCircle2, Search, Plus, CalendarClock, Trophy, Flame, TrendingUp, ClipboardCheck } from "lucide-react";
import { useReopenTask, useTasks } from "@/api/tasks";
import { ErrorBox, PageSkeleton } from "@/components/ui";
import { useAuth } from "@/contexts/auth";
import { useUi } from "@/contexts/ui";
import { fmtDate } from "@/lib/dates";
import { partition } from "@/lib/selectors";
import { label } from "@/types";

export default function Completed() {
  const { user } = useAuth(), ui = useUi(), q = useTasks(), reopen = useReopenTask(), [term, setTerm] = useState("");
  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !user) return <ErrorBox onRetry={() => q.refetch()} />;
  const tz = user.timezone;
  
  const allTasks = q.data ?? [];
  const p = partition(allTasks, tz);
  const rows = p.completed.filter((t) => t.title.toLowerCase().includes(term.toLowerCase()));

  const StatCard = ({ title, sub, count, icon: Icon, color, bg, val }: any) => (
    <div className="card flex items-center gap-4 !bg-[#12141F] hover:!bg-[#161825] transition-colors border border-line overflow-hidden relative group p-5">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${bg}`} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bg} bg-opacity-10`}>
        <Icon size={26} className={color} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-white leading-none">{count ?? val}</div>
        </div>
        <div className="text-xs font-semibold text-muted mt-1">{title}</div>
        <div className="text-[10px] text-muted/60 font-medium">{sub}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Completed</h1>
            <p className="text-muted text-sm font-medium">Everything you've <span className="text-emerald-400 font-bold">finished</span>.</p>
          </div>
        </div>
        <button className="btn !bg-gradient-to-r !from-indigo-600 !to-purple-600 !shadow-purple-500/25" onClick={() => ui.openNew()}><Plus size={16} />Add task</button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-9 !bg-[#0B0D17] !border-line h-10 text-sm focus:!border-emerald-500/50 w-full" placeholder="Search completed" aria-label="Search completed" value={term} onChange={(e) => setTerm(e.target.value)} />
      </div>

      <div className="flex-1 mb-8">
        {rows.length ? (
          <div className="card !bg-[#12141F] p-2 border border-line">
            <ul>{rows.map((t) => (
              <li key={t.id} className="flex items-center gap-4 border-b border-line py-3 px-2 last:border-0 hover:bg-surface2/50 rounded-lg transition-colors group">
                <button className="min-w-0 flex-1 text-left" onClick={() => ui.openDetail(t.id)}>
                  <div className="break-words font-semibold text-white/90 line-through decoration-emerald-500/50 mb-1">{t.title}</div>
                  <div className="text-[11px] font-medium text-muted flex gap-2">
                    <span className="text-emerald-400/80">{label(t.category)}</span> • 
                    <span>{label(t.priority)}</span>
                    {t.completed_at ? ` • Done ${new Date(t.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: tz })}` : ""}
                  </div>
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button className="btn-ghost py-1.5 px-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10" onClick={() => reopen.mutate(t)}>Restore</button>
                  <button className="rounded-md p-2 text-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors" aria-label={`Delete ${t.title} permanently`} onClick={() => ui.confirmDelete(t)}><Trash2 size={16} /></button>
                </div>
              </li>))}
            </ul>
          </div>
        ) : (
          <div className="card !bg-gradient-to-b from-[#12141F] to-[#0B0D17] border border-line h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#12141F]/0 to-transparent" />
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg shadow-emerald-500/20 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform">
                <ClipboardCheck size={64} className="text-white opacity-90" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{term ? "No matches" : "Nothing completed yet"}</h3>
              <p className="text-muted font-medium mb-6">{term ? "Try a different search." : "Finished tasks will appear here."}</p>
              {!term && <button className="btn-ghost !border-line !border !text-emerald-400 hover:!bg-emerald-500/10" onClick={() => ui.openNew()}><Plus size={16} />Complete your first task! 🎉</button>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-auto">
        <StatCard title="Tasks completed" sub="Keep going!" count={p.completed.length} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500" />
        <StatCard title="Completed today" sub="Great start!" count={p.completed.filter(t => t.completed_at && new Date(t.completed_at).toISOString().split('T')[0] === p.today).length} icon={CalendarClock} color="text-blue-500" bg="bg-blue-500" />
        <StatCard title="This week" sub="Stay productive!" count={p.completed.length} icon={Trophy} color="text-purple-500" bg="bg-purple-500" />
        <StatCard title="Total streak" sub="Let's build it!" count={0} icon={Flame} color="text-orange-500" bg="bg-orange-500" />
        <StatCard title="Completion rate" sub="You've got this!" val={allTasks.length ? `${Math.round((p.completed.length / allTasks.length) * 100)}%` : "0%"} icon={TrendingUp} color="text-cyan-400" bg="bg-cyan-500" />
      </div>
    </div>
  );
}
