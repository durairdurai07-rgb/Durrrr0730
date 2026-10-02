import { useTasks } from "@/api/tasks";
import { ErrorBox, PageSkeleton, TaskSection } from "@/components/ui";
import { useAuth } from "@/contexts/auth";
import { partition } from "@/lib/selectors";
import { Plus, Sunrise, CheckCircle, Clock, Flag, LayoutList } from "lucide-react";
import { useUi } from "@/contexts/ui";

export default function Today() {
  const { user } = useAuth(), q = useTasks(), ui = useUi();
  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !user) return <ErrorBox onRetry={() => q.refetch()} />;
  
  const p = partition(q.data ?? [], user.timezone), t = p.todayTasks;
  const slot = (f: (x: string | null) => boolean) => t.filter((x) => f(x.due_time));
  const parts: [string, typeof t][] = [
    ["Overdue", p.overdue], ["Morning", slot((x) => !!x && x < "12:00")], ["Afternoon", slot((x) => !!x && x >= "12:00" && x < "17:00")],
    ["Evening", slot((x) => !!x && x >= "17:00")], ["No time", slot((x) => !x)],
  ];
  const any = parts.some(([, l]) => l.length);

  const StatCard = ({ title, sub, count, icon: Icon, color, bg }: any) => (
    <div className="card flex items-center gap-4 !bg-[#12141F] hover:!bg-[#161825] transition-colors border border-line overflow-hidden relative group p-5">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${bg}`} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bg} bg-opacity-10`}>
        <Icon size={26} className={color} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-white leading-none">{count}</div>
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
            <Sunrise size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Today's Focus</h1>
            <p className="text-muted text-sm font-medium">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        <button className="btn !bg-gradient-to-r !from-indigo-600 !to-purple-600 !shadow-purple-500/25" onClick={() => ui.openNew()}><Plus size={16} />Add task</button>
      </div>

      <div className="flex-1 mb-8">
        {any ? (
          <div className="card !bg-[#12141F] p-4 border border-line">
            {parts.filter(([, l]) => l.length).map(([n, l]) => <TaskSection key={n} title={n} tasks={l} emptyTitle="" emptyHint="" />)}
          </div>
        ) : (
          <div className="card !bg-gradient-to-b from-[#12141F] to-[#0B0D17] border border-line h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#12141F]/0 to-transparent" />
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg shadow-blue-500/20 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform">
                <Sunrise size={64} className="text-white opacity-90" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You're all caught up!</h3>
              <p className="text-muted font-medium mb-6">Your day is clear. Enjoy your free time or get ahead.</p>
              <button className="btn-ghost !border-line !border !text-blue-400 hover:!bg-blue-500/10" onClick={() => ui.openNew()}><Plus size={16} />Add a task</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-auto">
        <StatCard title="Today's tasks" sub="Total for today" count={t.length} icon={LayoutList} color="text-blue-500" bg="bg-blue-500" />
        <StatCard title="Overdue" sub="Needs attention" count={p.overdue.length} icon={Clock} color="text-orange-500" bg="bg-orange-500" />
        <StatCard title="High priority" sub="Do these first" count={t.filter(x => x.priority === 'high').length} icon={Flag} color="text-purple-400" bg="bg-purple-500" />
        <StatCard title="Completed today" sub="Great progress!" count={p.completed.filter(x => x.completed_at && new Date(x.completed_at).toISOString().split('T')[0] === p.today).length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500" />
      </div>
    </div>
  );
}
