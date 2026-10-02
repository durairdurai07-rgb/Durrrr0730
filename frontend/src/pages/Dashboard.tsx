import { useState } from "react";
import { useTasks } from "@/api/tasks";
import { ErrorBox, PageSkeleton, TaskSection, Empty } from "@/components/ui";
import { TaskList } from "@/components/TaskRow";
import { useAuth } from "@/contexts/auth";
import { partition } from "@/lib/selectors";
import { wallNow } from "@/lib/dates";
import { CheckCircle2, Clock, Calendar, CheckCircle, Filter, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth(), q = useTasks();
  const [focusFilter, setFocusFilter] = useState("All");

  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !user) return <ErrorBox onRetry={() => q.refetch()} />;
  const tasks = q.data ?? [], tz = user.timezone;
  
  const p = partition(tasks, tz), h = wallNow(tz).getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  
  const chartData = [
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 1 }, 
    { name: 'Thu', value: 3 }, { name: 'Fri', value: 1 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
  ];

  const StatCard = ({ title, count, icon: Icon, color, bg }: any) => (
    <div className="card flex items-center gap-4 !bg-[#12141F] hover:!bg-[#161825] transition-colors border border-line overflow-hidden relative group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${bg}`} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bg} bg-opacity-10`}>
        <Icon size={28} className={color} />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-muted uppercase tracking-wider mb-1">{title}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-white leading-none">{count}</div>
          <div className="text-sm text-muted font-medium">{count === 1 ? 'task' : 'tasks'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-white">{greet}, Workspace <span className="inline-block animate-wave">👋</span></h1>
      </div>
      <p className="text-muted mb-8 text-base">Let's make today productive and awesome!</p>

      {/* KPI Cards Row */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today" count={p.todayTasks.length + p.overdue.filter((t) => t.due_date === p.today).length} icon={CheckCircle2} color="text-blue-500" bg="bg-blue-500" />
        <StatCard title="Overdue" count={p.overdue.length} icon={Clock} color="text-orange-500" bg="bg-orange-500" />
        <StatCard title="Upcoming" count={p.upcoming.length} icon={Calendar} color="text-indigo-400" bg="bg-indigo-500" />
        <StatCard title="Completed" count={p.completed.length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="card !bg-[#12141F] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">Focus for today</h2>
                <span className="bg-surface2 text-muted px-2 py-0.5 rounded-full text-xs font-bold">{p.must.length + p.todayTasks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-[#0B0D17] rounded-lg p-1 border border-line">
                  {["All", "High", "Medium", "Low"].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFocusFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${focusFilter === f ? 'bg-purple-600 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0B0D17] border border-line text-muted hover:text-white"><Filter size={14} /></button>
              </div>
            </div>
            
            <div className="mt-4">
              {([...p.must, ...p.todayTasks]).filter(t => focusFilter === "All" || t.priority === focusFilter.toLowerCase()).length > 0 ? (
                <TaskSection title="" tasks={[...p.must, ...p.todayTasks].filter(t => focusFilter === "All" || t.priority === focusFilter.toLowerCase())} emptyTitle="" emptyHint="" />
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-32 h-32 mb-4 mx-auto flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20 rotate-12 flex items-center justify-center group-hover:rotate-0 transition-transform relative z-10">
                      <div className="w-12 h-[2px] bg-white/40 absolute top-4 left-6" />
                      <div className="w-8 h-[2px] bg-white/40 absolute top-8 left-6" />
                      <div className="w-10 h-[2px] bg-white/40 absolute top-12 left-6" />
                      <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full" /></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Keep going! You've got this.</h3>
                  <p className="text-muted text-sm font-medium">Complete your tasks and achieve more every day.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card !bg-[#12141F] p-6">
            <h2 className="text-lg font-bold text-white mb-6">Productivity overview</h2>
            <div className="flex gap-8 items-end">
              <div className="flex-1 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1C29', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[10px] text-muted font-semibold mt-2 px-2 uppercase">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl border border-line bg-surface2/50 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">25%</div>
                  <div className="text-[10px] text-muted font-bold uppercase mt-1">Progress</div>
                </div>
                <div className="w-24 h-24 rounded-2xl border border-line bg-surface2/50 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-purple-400">{tasks.length}</div>
                  <div className="text-[10px] text-muted font-bold uppercase mt-1">Total tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="card !bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] border-purple-500/20 p-6 relative overflow-hidden h-40 flex items-center">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-left opacity-30 mix-blend-screen [mask-image:linear-gradient(to_left,white,transparent)]" />
            <div className="relative z-10 max-w-[200px]">
              <p className="text-[15px] font-medium text-white leading-relaxed mb-3">"Discipline is the bridge between goals and accomplishment."</p>
              <p className="text-xs text-purple-300/80 font-medium">— Jim Rohn</p>
            </div>
          </div>

          <div className="card !bg-[#12141F] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white">Next deadlines</h2>
              <button className="text-xs font-bold text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full transition-colors">View all</button>
            </div>
            {p.upcoming.length ? <TaskList tasks={p.upcoming.slice(0, 5)} /> : <div className="py-8"><Empty title="No upcoming deadlines" hint="Add a task with a date to see it here." /></div>}
          </div>

          <MiniCalendar />

          <div className="card !bg-[#12141F] border-purple-500/20 p-6 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-12 group-hover:rotate-0 transition-transform">
              <Rocket size={32} className="text-white fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">You're on fire! 🔥</h3>
              <p className="text-sm text-muted font-medium">{p.todayTasks.length} {p.todayTasks.length === 1 ? 'task' : 'tasks'} for today.<br/>Let's crush it!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniCalendar() {
  const [offsetDays, setOffsetDays] = useState(0);
  
  const today = new Date();
  // Set to current date + offset
  const currentDate = new Date(today);
  currentDate.setDate(today.getDate() + offsetDays);
  
  // Find the Monday of the current displayed week
  const dayOfWeek = currentDate.getDay(); // 0 is Sunday
  const diffToMonday = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(currentDate);
  monday.setDate(diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const isToday = (d: Date) => {
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long' });
  const yearName = currentDate.getFullYear();

  return (
    <div className="card !bg-[#12141F] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-white">Calendar</h2>
        <div className="flex items-center gap-3 text-xs font-bold text-muted">
          {monthName} {yearName}
          <div className="flex gap-2 bg-[#0B0D17] p-1 rounded-md border border-line">
            <button className="hover:text-white p-0.5" onClick={() => setOffsetDays(o => o - 7)}><ChevronLeft size={14}/></button>
            <button className="hover:text-white p-0.5" onClick={() => setOffsetDays(o => o + 7)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-4 text-center text-xs">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} className="text-muted font-bold mb-2">{day}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} className={`flex items-center justify-center font-semibold ${d.getMonth() !== currentDate.getMonth() ? 'text-muted/40' : 'text-white'}`}>
            {isToday(d) ? (
              <div className="font-bold text-white bg-purple-600 rounded-full w-7 h-7 flex items-center justify-center shadow-lg shadow-purple-500/20">{d.getDate()}</div>
            ) : (
              d.getDate()
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
