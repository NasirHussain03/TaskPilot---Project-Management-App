import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await API.get('/tasks');
        setTasks(data);
      } catch (err) {
        setError('Failed to fetch tasks for calendar');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Prev month padding days
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  
  const daysArray = [];

  // Padded days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthDaysCount - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDaysCount - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Padded days from next month (fill up grid to multiples of 7, usually 35 or 42 cells)
  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to format month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get tasks due on a specific date
  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const priorityColor = (p) => {
    if (p === 'High') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-slate-800 text-slate-400 border border-slate-700/50';
  };

  const statusColor = (s) => {
    if (s === 'Todo') return 'text-amber-400';
    if (s === 'In Progress') return 'text-indigo-400';
    return 'text-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FiCalendar className="text-violet-400" />
            Calendar Integration
          </h2>
          <p className="text-xs text-slate-400 mt-1">Visualize deadlines, schedules, and due tasks across the workspace.</p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-350 hover:text-slate-200 transition-all cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-200 min-w-[100px] text-center select-none">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Days of Week Labels */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center py-2 sm:py-3">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 border-t border-slate-800/20">
          {daysArray.map((cell, index) => {
            const dateTasks = getTasksForDate(cell.date);
            const isToday =
              new Date().getDate() === cell.date.getDate() &&
              new Date().getMonth() === cell.date.getMonth() &&
              new Date().getFullYear() === cell.date.getFullYear();

            return (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 flex flex-col justify-between transition-all ${
                  cell.isCurrentMonth ? 'bg-transparent' : 'bg-slate-950/20 opacity-40'
                } ${isToday ? 'bg-violet-950/10 border border-violet-500/20' : ''}`}
              >
                {/* Date Label */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center'
                        : cell.isCurrentMonth
                        ? 'text-slate-350'
                        : 'text-slate-600'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dateTasks.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-850 border border-slate-800 text-slate-400 font-bold">
                      {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[75px] pr-0.5 custom-scrollbar">
                  {dateTasks.slice(0, 3).map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full text-left p-1.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 rounded-lg transition-all cursor-pointer truncate"
                    >
                      <p className="text-[10px] font-bold text-slate-200 truncate leading-snug">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1 h-1 rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500'
                            : task.status === 'In Progress'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`} />
                        <span className="text-[8px] text-slate-550 uppercase tracking-widest font-bold">
                          {task.project?.title || 'No Project'}
                        </span>
                      </div>
                    </button>
                  ))}
                  {dateTasks.length > 3 && (
                    <div className="text-[9px] text-slate-500 font-semibold pl-1 text-center">
                      +{dateTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Dialog Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority} Priority
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-2">{selectedTask.title}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  {selectedTask.project?.title || 'Direct Workspace Task'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-500 hover:text-slate-350 transition-colors cursor-pointer text-sm font-bold bg-slate-950/40 border border-slate-800 h-7 w-7 rounded-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 border-t border-b border-slate-850 py-4">
              {/* Description */}
              {selectedTask.description ? (
                <div className="space-y-1">
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Description</span>
                  <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/30 border border-slate-850 p-2.5 rounded-xl">{selectedTask.description}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">No description provided for this task.</p>
              )}

              {/* Status / Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedTask.status === 'Completed'
                        ? 'bg-emerald-500'
                        : selectedTask.status === 'In Progress'
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`} />
                    <span className={statusColor(selectedTask.status)}>{selectedTask.status}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Deadline</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <FiClock className="text-violet-400 shrink-0 text-xs" />
                    <span>{new Date(selectedTask.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Assigned Member</span>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 uppercase">
                    {selectedTask.assignedTo ? selectedTask.assignedTo.name[0] : '?'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-350">
                      {selectedTask.assignedTo ? selectedTask.assignedTo.name : 'Unassigned'}
                    </p>
                    <p className="text-[9px] text-slate-600">
                      {selectedTask.assignedTo ? selectedTask.assignedTo.email : 'No collaborator assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
