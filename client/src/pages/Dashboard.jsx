import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import { FiCheckSquare, FiBriefcase, FiClock, FiAlertTriangle, FiActivity, FiCheck, FiArrowRight, FiMessageSquare, FiEdit, FiFolderPlus, FiTrash2, FiPieChart, FiBarChart2 } from 'react-icons/fi';

const actionIcon = (action) => {
  if (action.includes('Created Project')) return { icon: FiFolderPlus, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
  if (action.includes('Created Task')) return { icon: FiCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (action.includes('Deleted')) return { icon: FiTrash2, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  if (action.includes('Moved')) return { icon: FiArrowRight, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
  if (action.includes('Comment')) return { icon: FiMessageSquare, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  return { icon: FiEdit, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes, activitiesRes] = await Promise.all([
          API.get('/tasks'),
          API.get('/projects'),
          API.get('/activities'),
        ]);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
        setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center">
        {error}
      </div>
    );
  }

  // Calculate KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now
  ).length;

  const todoCount = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;

  // Calculate project progress breakdown
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.project?._id === project._id || t.project === project._id);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'Completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      id: project._id,
      title: project.title,
      total,
      completed,
      percent,
    };
  });

  // Recharts Status Pie Data
  const statusData = totalTasks > 0 ? [
    { name: 'Todo', value: todoCount, color: '#fbbf24' },
    { name: 'In Progress', value: inProgressCount, color: '#6366f1' },
    { name: 'Completed', value: completedTasks, color: '#10b981' },
  ] : [
    { name: 'No Tasks Created', value: 1, color: '#334155' }
  ];

  // Recharts Projects Bar Data
  const projectChartData = projectProgress.map(p => ({
    name: p.title.length > 12 ? p.title.substring(0, 10) + '...' : p.title,
    'Total Tasks': p.total,
    'Completed Tasks': p.completed,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <FiActivity className="text-violet-400 animate-pulse" />
          Dashboard Overview
        </h2>
        <p className="text-xs text-slate-400 mt-1">Get real-time insights, metrics, and progress logs across your projects.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-200 group">
          <div>
            <p className="text-sm font-semibold text-slate-400">Total Tasks</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-100 group-hover:scale-105 transition-transform duration-200 origin-left">{totalTasks}</h3>
          </div>
          <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/10 group-hover:bg-violet-600 group-hover:text-white transition-all">
            <FiCheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-200 group">
          <div>
            <p className="text-sm font-semibold text-slate-400">Completed Tasks</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-400 group-hover:scale-105 transition-transform duration-200 origin-left">{completedTasks}</h3>
          </div>
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/10 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <FiBriefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-200 group">
          <div>
            <p className="text-sm font-semibold text-slate-400">Pending Tasks</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-400 group-hover:scale-105 transition-transform duration-200 origin-left">{pendingTasks}</h3>
          </div>
          <div className="p-3.5 bg-amber-600/10 text-amber-400 rounded-xl border border-amber-500/10 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <FiClock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-200 group">
          <div>
            <p className="text-sm font-semibold text-slate-400">Overdue Tasks</p>
            <h3 className="text-3xl font-bold mt-1 text-rose-400 group-hover:scale-105 transition-transform duration-200 origin-left">{overdueTasks}</h3>
          </div>
          <div className="p-3.5 bg-rose-600/10 text-rose-400 rounded-xl border border-rose-500/10 group-hover:bg-rose-600 group-hover:text-white transition-all">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Breakdown (PieChart) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FiPieChart className="text-violet-400" />
              Task Status Breakdown
            </h4>
            <p className="text-xs text-slate-400">Distribution of active task states</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Recharts Pie */}
            <div className="h-40 w-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-100">{totalTasks}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Tasks</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3.5 shrink-0">
              {totalTasks > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded bg-amber-400 shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Todo</p>
                      <span className="text-[10px] text-slate-500 font-bold">{todoCount} tasks ({Math.round((todoCount / totalTasks) * 100)}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded bg-indigo-500 shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">In Progress</p>
                      <span className="text-[10px] text-slate-500 font-bold">{inProgressCount} tasks ({Math.round((inProgressCount / totalTasks) * 100)}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded bg-emerald-500 shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Completed</p>
                      <span className="text-[10px] text-slate-500 font-bold">{completedTasks} tasks ({Math.round((completedTasks / totalTasks) * 100)}%)</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-xs italic">
                  Create tasks to activate legend
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Task Metrics (BarChart) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FiBarChart2 className="text-violet-400" />
              Project Metrics
            </h4>
            <p className="text-xs text-slate-400">Total vs completed task metrics per project</p>
          </div>

          <div className="w-full">
            {projectProgress.length > 0 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '12px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                    <Bar dataKey="Total Tasks" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Completed Tasks" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-600 py-12 italic">
                No project metrics available. Create a project to start.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="mb-6 flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
          <FiActivity className="text-violet-400" />
          <div>
            <h4 className="text-lg font-bold text-slate-200">Recent Activity Logs</h4>
            <p className="text-xs text-slate-400">Latest administrative and task-level audits</p>
          </div>
        </div>
        
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {activities.length > 0 ? activities.map((a) => {
            const { icon: Icon, color } = actionIcon(a.action);
            return (
              <div key={a._id} className="flex items-start gap-3.5 hover:bg-slate-900/20 p-2 rounded-xl transition-all">
                <span className={`shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center text-xs font-bold ${color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-semibold">{a.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.details}</p>
                  <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-2 font-medium">
                    <span>by <strong className="text-slate-500">{a.user?.name || 'Deleted User'}</strong></span>
                    <span>•</span>
                    <span className="bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-slate-500">{a.project?.title || 'System'}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>
            );
          }) : (
            <p className="text-xs text-slate-500 text-center py-8">No audit activity logged. Start managing tasks to populate logs.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
