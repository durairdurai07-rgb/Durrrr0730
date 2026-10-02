import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";
import { useTasks } from "@/api/tasks";
import { useAuth } from "@/contexts/auth";
import { TaskList } from "@/components/TaskRow";
import { Empty } from "@/components/ui";
import { todayIn } from "@/lib/dates";

export function MonthlyCalendar({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { data: tasks = [] } = useTasks();
  const tz = user?.timezone || "UTC";
  const todayStr = todayIn(tz);
  
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToday = () => {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    d.setDate(1);
    setCurrentDate(d);
    setSelectedDate(todayStr);
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get the first day of the month (0 = Sunday)
    const firstDay = new Date(year, month, 1).getDay();
    // Start from Monday (so adjust if firstDay is 0 (Sunday) to 6, else firstDay - 1)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Previous month filler days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month filler days (to complete the grid)
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  const p = (n: number) => String(n).padStart(2, "0");
  const formatDateString = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(t => t.due_date === selectedDate);
  }, [selectedDate, tasks]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#12141F] border border-line rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Calendar Section */}
        <div className="flex-1 p-4 sm:p-8 border-r border-line overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <CalendarIcon size={20} className="text-white" />
              </div>
              Monthly Calendar
            </h2>
            <button onClick={onClose} className="md:hidden w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-muted hover:text-white"><X size={18}/></button>
          </div>
          
          <div className="flex items-center justify-between mb-6 bg-[#0B0D17] p-2 rounded-xl border border-line shadow-inner">
            <button onClick={prevMonth} className="p-2 text-muted hover:text-white hover:bg-surface2 rounded-lg transition-colors"><ChevronLeft size={20}/></button>
            <div className="text-base sm:text-lg font-bold text-white tracking-wide">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold bg-surface2 text-muted hover:text-white rounded-lg transition-colors shadow-sm">Today</button>
              <button onClick={nextMonth} className="p-2 text-muted hover:text-white hover:bg-surface2 rounded-lg transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-3">
            {daysInMonth.map((dayObj, i) => {
              const dStr = formatDateString(dayObj.date);
              const dayTasks = tasks.filter(t => t.due_date === dStr);
              const pendingCount = dayTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
              const isToday = dStr === todayStr;
              const isSelected = dStr === selectedDate;
              
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(dStr)}
                  className={`
                    relative flex flex-col h-16 sm:h-24 p-1.5 sm:p-3 rounded-xl border transition-all text-left group
                    ${dayObj.isCurrentMonth ? 'bg-[#0B0D17] border-line' : 'bg-[#0B0D17]/40 border-line/40 opacity-60'}
                    ${isSelected ? '!border-purple-500 ring-2 ring-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent shadow-lg shadow-purple-500/5' : 'hover:border-purple-500/50 hover:bg-[#151722]'}
                    ${isToday && !isSelected ? '!border-blue-500 ring-1 ring-blue-500/50' : ''}
                  `}
                >
                  <div className={`text-xs sm:text-sm font-bold mb-1 ${isToday ? 'text-blue-400' : 'text-white'}`}>
                    {dayObj.date.getDate()}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="mt-auto">
                      <div className={`
                        text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md inline-flex items-center gap-1 sm:gap-1.5
                        ${pendingCount > 0 ? 'text-purple-300 bg-purple-500/20' : 'text-emerald-300 bg-emerald-500/20'}
                        group-hover:scale-105 transition-transform origin-left
                      `}>
                        <div className={`hidden sm:block w-1.5 h-1.5 rounded-full ${pendingCount > 0 ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                        {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Task Details Section */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-[#0B0D17]/80 backdrop-blur-md p-6 sm:p-8 flex flex-col h-[50vh] md:h-auto overflow-y-auto relative border-t md:border-t-0 md:border-l border-line">
          <button onClick={onClose} className="absolute top-6 right-6 hidden md:flex w-8 h-8 rounded-full bg-surface2 items-center justify-center text-muted hover:text-white transition-colors"><X size={18}/></button>
          
          <div className="mb-6 pr-8">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Schedule</h3>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
            </div>
          </div>
          
          <div className="flex-1">
            {!selectedDate ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p>Click on any date to see the tasks scheduled for that day.</p>
              </div>
            ) : selectedTasks.length > 0 ? (
              <TaskList tasks={selectedTasks} />
            ) : (
              <div className="pt-12">
                <Empty title="No tasks" hint="You have a free day! Enjoy your time." />
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
