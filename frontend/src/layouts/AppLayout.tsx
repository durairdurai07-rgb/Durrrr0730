import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, BarChart3, CalendarClock, CheckCircle2, ChevronsLeft, ChevronsRight, Crown, LayoutDashboard, ListTodo, LogOut, Monitor, Moon, Plus, Search, Sparkles, Sun, Sunrise } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { useUi } from "@/contexts/ui";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/today", label: "Today", icon: Sunrise },
  { to: "/tasks", label: "My tasks", icon: ListTodo },
  { to: "/upcoming", label: "Upcoming", icon: CalendarClock },
  { to: "/completed", label: "Completed", icon: CheckCircle2 },
];

export default function AppLayout() {
  const { user, logout } = useAuth(), { theme, cycle } = useTheme(), ui = useUi(), nav = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("myday.collapsed") === "1");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => { localStorage.setItem("myday.collapsed", collapsed ? "1" : "0"); }, [collapsed]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName, typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.current?.focus(); }
      else if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing && !document.querySelector('[role="dialog"]')) { e.preventDefault(); ui.openNew(); }
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [ui]);
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const link = (small = false) => ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${small ? "flex-1 flex-col gap-0.5 text-[11px]" : ""} ${isActive ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/20 font-semibold text-purple-400 border border-purple-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "text-muted hover:bg-surface2 hover:text-ink"} ${small ? "!text-muted" : ""}`;
  return (
    <div className={`min-h-screen md:grid ${collapsed ? "md:grid-cols-[68px_1fr]" : "md:grid-cols-[236px_1fr]"}`}>
      <aside className="sticky top-0 hidden h-screen flex-col gap-5 overflow-y-auto border-r border-line bg-[#0B0D17]/80 backdrop-blur-2xl p-4 md:flex shadow-2xl z-10 w-[260px]">
        <div className="flex items-center justify-between mb-2">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
                <img src="/custom-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold tracking-widest text-white text-sm">MY DAY</div>
              </div>
            </div>
          )}
          <button className="rounded-md p-1.5 text-muted hover:bg-surface2" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}</button>
        </div>
        {!collapsed && (
          <div className="px-1 -mt-3 mb-2">
            <div className="text-[10px] text-muted uppercase tracking-wider font-semibold flex items-center gap-1">Plan it. Remember it. Finish it. <Sparkles size={10} className="text-purple-400" /></div>
          </div>
        )}
        <nav aria-label="Main" className="grid gap-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} title={label} className={link()}><Icon size={18} />{!collapsed && label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          {!collapsed && (
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 p-4 shadow-lg mb-2">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full" />
              <Crown size={20} className="text-yellow-500 mb-2" />
              <div className="font-bold text-white text-sm mb-1">Upgrade to Pro</div>
              <div className="text-[11px] text-muted mb-3 leading-relaxed">Unlock unlimited tasks, custom themes and powerful analytics.</div>
              <button className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5">Upgrade Now</button>
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <button className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-surface2 text-muted hover:text-ink transition-colors" onClick={cycle} title="Change theme">
              <div className="flex items-center gap-3"><ThemeIcon size={18} />{!collapsed && <span className="text-sm">Theme: {theme[0].toUpperCase() + theme.slice(1)}</span>}</div>
            </button>
            <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface2 text-muted hover:text-ink transition-colors" onClick={() => { logout(); nav("/access"); }} title="Lock workspace"><LogOut size={18} />{!collapsed && <span className="text-sm">Lock workspace</span>}</button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 bg-[#0B0D17]">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-[#0B0D17]/90 px-6 py-3 backdrop-blur-2xl">
          <form className="relative max-w-md flex-1 group" role="search" onSubmit={(e) => { e.preventDefault(); const q = search.current?.value.trim(); nav(q ? `/tasks?q=${encodeURIComponent(q)}` : "/tasks"); }}>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-purple-400 transition-colors" />
            <input ref={search} className="input pl-10 pr-16 bg-[#151722] border-transparent focus:border-purple-500/50 focus:bg-[#1A1C29] focus:ring-4 focus:ring-purple-500/10" placeholder="Search tasks..." aria-label="Search tasks" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-line bg-surface2 px-1.5 font-mono text-[10px] font-medium text-muted">Ctrl/Cmd + K</kbd>
            </div>
          </form>
          
          <div className="flex items-center gap-2 ml-auto">
            {activeDropdown && (
              <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
            )}
            
            <span 
              className="hidden text-muted lg:block text-sm font-medium mr-4 flex items-center gap-2 cursor-pointer hover:text-white transition-colors relative z-50"
              onClick={() => setCalendarOpen(true)}
              title="Open Calendar"
            >
              <CalendarClock size={16} />{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <button className="btn-ghost md:hidden relative z-50" onClick={cycle} aria-label="Change theme"><ThemeIcon size={16} /></button>
            <button className="btn hidden md:inline-flex !bg-gradient-to-r !from-indigo-600 !to-purple-600 !shadow-purple-500/25 relative z-50" onClick={() => ui.openNew()} title="Shortcut: N"><Plus size={16} />Add task</button>
            
            <div className="relative z-50">
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ml-2 ${activeDropdown === 'notif' ? 'bg-surface2 text-white' : 'text-muted hover:bg-surface2'}`}
                onClick={() => setActiveDropdown(activeDropdown === 'notif' ? null : 'notif')}
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500"></span>
              </button>
              {activeDropdown === 'notif' && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#151722] border border-line rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-line font-semibold text-sm text-white">Notifications</div>
                  <div className="p-8 flex flex-col items-center justify-center text-center text-sm text-muted">
                    <Bell size={32} className="mb-3 text-muted/30" />
                    <p>You have no new notifications.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-50">
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-surface2 transition-colors"
                onClick={() => nav("/")}
                title="Statistics Dashboard"
              >
                <BarChart3 size={18} />
              </button>
            </div>

            <div className="relative z-50">
              <div 
                className={`w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 p-0.5 ml-2 cursor-pointer border-2 hover:scale-105 transition-all ${activeDropdown === 'profile' ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-surface'}`}
                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                title="Profile Settings"
              >
                <div className="w-full h-full rounded-full bg-surface2 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || "User"}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              {activeDropdown === 'profile' && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#151722] border border-line rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-line mb-1 bg-[#1A1C29]">
                    <div className="text-sm font-bold text-white truncate">{user?.name || "Workspace"}</div>
                    <div className="text-[11px] text-muted truncate mt-0.5">{user?.email || "user@example.com"}</div>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-surface2 hover:text-white transition-colors flex items-center gap-2" onClick={() => { cycle(); setActiveDropdown(null); }}>
                    <ThemeIcon size={14} /> Toggle Theme
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2" onClick={() => { logout(); nav("/access"); }}>
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 md:px-8 md:pb-16"><Outlet /></main>
      </div>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface p-1.5 md:hidden" style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))" }}>
        {NAV.slice(0, 2).map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={link(true)}><Icon size={20} />{label}</NavLink>)}
        <button className="flex flex-1 flex-col items-center gap-0.5 text-[11px] font-semibold text-accent" onClick={() => ui.openNew()}><span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accenton"><Plus size={18} /></span>Add</button>
        {NAV.slice(3, 5).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={link(true)}><Icon size={20} />{label}</NavLink>)}
        <button className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2.5 py-2 text-[11px] text-muted" onClick={() => { logout(); nav("/access"); }}><LogOut size={20} />Lock</button>
      </nav>

      {calendarOpen && <MonthlyCalendar onClose={() => setCalendarOpen(false)} />}
    </div>
  );
}
