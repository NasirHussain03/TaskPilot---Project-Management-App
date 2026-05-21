import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        API.get('/projects'),
        API.get('/users'),
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch projects or users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    setSelectedMembers([]);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setCurrentProjectId(project._id);
    setTitle(project.title);
    setDescription(project.description || '');
    setSelectedMembers(project.members.map((m) => m._id));
    setIsModalOpen(true);
  };

  const handleMemberToggle = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      return setError('Project title is required');
    }

    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        const response = await API.post('/projects', {
          title,
          description,
          members: selectedMembers,
        });
        setProjects([response.data, ...projects]);
      } else {
        const response = await API.put(`/projects/${currentProjectId}`, {
          title,
          description,
          members: selectedMembers,
        });
        setProjects(projects.map((p) => (p._id === currentProjectId ? response.data : p)));
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }

    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
          <p className="text-slate-400 text-sm">Manage your collaborative work folders</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-violet-600/20 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center text-sm">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => {
            const isCreator = project.createdBy?._id === currentUser?._id;
            const canManage = isCreator || currentUser?.role === 'Admin';
            return (
              <div
                key={project._id}
                className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg space-y-4 hover:border-slate-700/60 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                            title="Edit Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                            title="Delete Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Creator: {project.createdBy?.name || 'Unknown'}</span>
                    <span>{project.members?.length || 0} Member(s)</span>
                  </div>

                  {/* Members Avatars list */}
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 5).map((member) => (
                      <div
                        key={member._id}
                        className="inline-block h-7 w-7 rounded-full bg-slate-800 ring-2 ring-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase"
                        title={member.name}
                      >
                        {member.name?.[0]}
                      </div>
                    ))}
                    {project.members?.length > 5 && (
                      <div className="inline-block h-7 w-7 rounded-full bg-slate-800 ring-2 ring-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-slate-900/20 border border-slate-800/80 border-dashed py-12 rounded-2xl text-center text-slate-400 text-sm">
            No projects found. Click "New Project" to build one!
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-100">
                {modalMode === 'create' ? 'Create Project' : 'Edit Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-slate-100 placeholder-slate-600 transition-all text-sm"
                  placeholder="e.g. Website Redesign"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-slate-100 placeholder-slate-600 transition-all text-sm h-24 resize-none"
                  placeholder="Summarize the project goals..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Collaborating Members
                </label>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                  {users.filter(u => u._id !== currentUser._id).length > 0 ? (
                    users
                      .filter((u) => u._id !== currentUser._id)
                      .map((u) => {
                        const isChecked = selectedMembers.includes(u._id);
                        return (
                          <label
                            key={u._id}
                            className="flex items-center gap-3 text-sm text-slate-300 select-none cursor-pointer p-1 rounded hover:bg-slate-800/40"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMemberToggle(u._id)}
                              className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer h-4 w-4"
                            />
                            <span>{u.name} ({u.role})</span>
                          </label>
                        );
                      })
                  ) : (
                    <p className="text-xs text-slate-600 text-center py-4">No other users available in workspace.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-slate-300 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800/50 text-white font-semibold rounded-xl transition-all cursor-pointer"
                >
                  {submitLoading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
