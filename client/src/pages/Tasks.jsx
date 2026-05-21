import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';

const STATUSES = ['Todo', 'In Progress', 'Completed'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

// ─── helpers ─────────────────────────────────────────────
const priorityColor = (p) => {
  if (p === 'High') return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  if (p === 'Medium') return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
  return 'text-slate-400 border-slate-600/30 bg-slate-700/20';
};

const colAccent = (s) => {
  if (s === 'Todo') return { badge: 'text-amber-400 border-amber-500/20 bg-amber-500/10', border: 'border-amber-500/20' };
  if (s === 'In Progress') return { badge: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10', border: 'border-indigo-500/20' };
  return { badge: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', border: 'border-emerald-500/20' };
};

// ─── Task Card ────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onDragStart }) => {
  const overdue = task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date();
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3 cursor-grab active:cursor-grabbing hover:border-slate-700 transition-all group shadow-sm"
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{task.project?.title}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${priorityColor(task.priority)}`}>{task.priority}</span>
      </div>
      <p className="text-sm font-bold text-slate-200 group-hover:text-violet-400 transition-colors leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className={overdue ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}
        </span>
        <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300 uppercase" title={task.assignedTo?.name || 'Unassigned'}>
          {task.assignedTo ? task.assignedTo.name[0] : '?'}
        </span>
      </div>
      <div className="flex justify-between items-center border-t border-slate-800/50 pt-2">
        <span className="text-[10px] text-slate-600">{task.comments?.length || 0} comment{task.comments?.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer" title="View / Edit">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => onDelete(task._id)} className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer" title="Delete">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Task Detail / Comments Modal ─────────────────────────
const TaskDetailModal = ({ task, onClose, onUpdate, onEdit, currentUser, projects }) => {
  const [commentText, setCommentText] = useState('');
  const [localTask, setLocalTask] = useState(task);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/tasks/${localTask._id}/comments`, { text: commentText });
      setLocalTask(data);
      onUpdate(data);
      setCommentText('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      // 1. Upload to Server static folder
      const uploadRes = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // 2. Attach to task
      const { data } = await API.post(`/tasks/${localTask._id}/attachments`, {
        name: uploadRes.data.name,
        url: uploadRes.data.url,
      });
      setLocalTask(data);
      onUpdate(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const { data } = await API.delete(`/tasks/${localTask._id}/attachments/${attachmentId}`);
      setLocalTask(data);
      onUpdate(data);
    } catch (err) {
      console.error(err);
    }
  };

  const matchingProject = projects.find((p) => p._id === (localTask.project?._id || localTask.project));
  const isCreator = matchingProject?.createdBy?._id === currentUser?._id || matchingProject?.createdBy === currentUser?._id;
  const isMember = matchingProject?.members?.some((m) => m?._id === currentUser?._id || m === currentUser?._id);
  const isAssignee = localTask.assignedTo?._id === currentUser?._id || localTask.assignedTo === currentUser?._id;
  const canEdit = isCreator || isMember || isAssignee || currentUser?.role === 'Admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="space-y-1 pr-4">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${priorityColor(localTask.priority)}`}>{localTask.priority}</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{localTask.title}</h3>
            <p className="text-xs text-slate-400">{localTask.project?.title} · {localTask.status}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {canEdit && (
              <button
                onClick={() => {
                  onEdit(localTask);
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                title="Edit Task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-200 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {localTask.description && <p className="text-sm text-slate-400 bg-slate-950/40 rounded-xl p-3 border border-slate-800">{localTask.description}</p>}
          
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-450 border-b border-slate-850 pb-4">
            <div><span className="font-bold text-slate-550 block mb-0.5 uppercase tracking-wide">Assigned To</span>{localTask.assignedTo?.name || 'Unassigned'}</div>
            <div><span className="font-bold text-slate-550 block mb-0.5 uppercase tracking-wide">Due Date</span>{localTask.dueDate ? new Date(localTask.dueDate).toLocaleDateString() : 'None'}</div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3 border-b border-slate-850 pb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments ({localTask.attachments?.length || 0})</h4>
              {canEdit && (
                <label className="cursor-pointer text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 select-none">
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                  {uploading ? 'Uploading...' : '+ Upload File'}
                </label>
              )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {localTask.attachments && localTask.attachments.length > 0 ? (
                localTask.attachments.map((att) => (
                  <div key={att._id} className="flex items-center justify-between bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl text-xs">
                    <a
                      href={`http://localhost:5000${att.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-violet-400 hover:underline font-semibold truncate max-w-[80%]"
                    >
                      📎 {att.name}
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => handleRemoveAttachment(att._id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer text-xs p-1"
                        title="Remove Attachment"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 text-center italic py-2">No attachments uploaded.</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments ({localTask.comments?.length || 0})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {localTask.comments?.length > 0 ? localTask.comments.map((c, i) => (
                <div key={i} className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-[9px] font-bold text-violet-400 uppercase">{c.user?.name?.[0] || '?'}</span>
                    <span className="text-xs font-semibold text-slate-350">{c.user?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-7 leading-relaxed">{c.text}</p>
                </div>
              )) : <p className="text-xs text-slate-650 text-center py-4 italic">No comments yet. Be the first!</p>}
            </div>
          </div>
        </div>
        {/* Comment Input */}
        <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600"
          />
          <button onClick={handleComment} disabled={submitting || !commentText.trim()} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create / Edit Form Modal ─────────────────────────────
const TaskFormModal = ({ mode, initial, projects, eligibleAssignees, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'Todo',
    priority: initial?.priority || 'Medium',
    dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    assignedTo: initial?.assignedTo?._id || '',
    project: initial?.project?._id || projects[0]?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return setError('Title is required');
    setLoading(true);
    try {
      if (mode === 'create') {
        const { data } = await API.post('/tasks', { ...form, dueDate: form.dueDate || null, assignedTo: form.assignedTo || null });
        onSave(data, 'create');
      } else {
        const { data } = await API.put(`/tasks/${initial._id}`, { ...form, dueDate: form.dueDate || null, assignedTo: form.assignedTo || null });
        onSave(data, 'update');
      }
      onClose();
    } catch (e) { setError(e.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const activeProject = projects.find((p) => p._id === form.project);
  const assignees = activeProject ? [activeProject.createdBy, ...activeProject.members].filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">{mode === 'create' ? 'New Task' : 'Edit Task'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {error && <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</div>}
        {mode === 'create' && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project</label>
            <select value={form.project} onChange={(e) => set('project', e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100">
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Task title" className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Details..." className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100">
              {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assignee</label>
            <select value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100">
              <option value="">Unassigned</option>
              {assignees.map((u) => u && <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-all cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="w-1/2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer">{loading ? 'Saving…' : 'Save Task'}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modal state
  const [formModal, setFormModal] = useState(null); // null | { mode, initial }
  const [detailTask, setDetailTask] = useState(null);

  const { user: currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const [tRes, pRes] = await Promise.all([API.get('/tasks'), API.get('/projects')]);
      setTasks(tRes.data);
      setProjects(pRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time synchronization
  useEffect(() => {
    socket.on('task:created', (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
      setDetailTask((current) => (current && current._id === updatedTask._id ? updatedTask : current));
    });

    socket.on('task:deleted', (deletedId) => {
      setTasks((prev) => prev.filter((t) => t._id !== deletedId));
      setDetailTask((current) => (current && current._id === deletedId ? null : current));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, []);

  // ── Drag & Drop ──────────────────────────────────────────
  const handleDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;
    // Optimistic update
    setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === data._id ? data : t));
    } catch (e) {
      // Revert
      setTasks((prev) => prev.map((t) => t._id === taskId ? task : t));
    }
  };

  // ── Task mutations ────────────────────────────────────────
  const handleSave = (savedTask, mode) => {
    if (mode === 'create') setTasks((prev) => [savedTask, ...prev]);
    else setTasks((prev) => prev.map((t) => t._id === savedTask._id ? savedTask : t));
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete'); }
  };

  const handleCommentUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t));
    setDetailTask(updated);
  };

  // ── Filtering ─────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === 'all' || t.project?._id === filterProject;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchProject && matchPriority;
  });

  const columns = STATUSES.reduce((acc, s) => { acc[s] = filtered.filter((t) => t.status === s); return acc; }, {});

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Tasks Board</h2>
          <p className="text-slate-400 text-sm">Drag cards between columns to update status</p>
        </div>
        <button onClick={() => setFormModal({ mode: 'create', initial: null })} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600" />
        </div>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500">
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <div className="flex rounded-xl border border-slate-800 overflow-hidden">
          {PRIORITIES.map((pr) => (
            <button key={pr} onClick={() => setFilterPriority(pr)} className={`px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${filterPriority === pr ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{pr}</button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {STATUSES.map((col) => {
          const { badge, border } = colAccent(col);
          const isOver = dragOverCol === col;
          return (
            <div
              key={col}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col)}
              className={`bg-slate-900/20 border rounded-2xl p-4 sm:p-5 flex flex-col min-h-[280px] sm:min-h-[480px] transition-all ${isOver ? `${border} bg-slate-900/60 scale-[1.01]` : 'border-slate-800'}`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badge}`}>{col}</span>
                  <span className="text-slate-400 text-xs font-semibold">({columns[col].length})</span>
                </div>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {columns[col].length > 0
                  ? columns[col].map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={(t) => setDetailTask(t)}
                      onDelete={handleDelete}
                      onDragStart={handleDragStart}
                    />
                  ))
                  : <div className={`flex-1 h-full min-h-32 flex items-center justify-center rounded-xl border-2 border-dashed text-xs text-slate-600 transition-all ${isOver ? 'border-violet-500/40 text-violet-500' : 'border-slate-800/60'}`}>
                    {isOver ? 'Drop here' : 'Empty'}
                  </div>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {formModal && (
        <TaskFormModal
          mode={formModal.mode}
          initial={formModal.initial}
          projects={projects}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onUpdate={handleCommentUpdate}
          onEdit={(task) => setFormModal({ mode: 'edit', initial: task })}
          currentUser={currentUser}
          projects={projects}
        />
      )}
    </div>
  );
}
