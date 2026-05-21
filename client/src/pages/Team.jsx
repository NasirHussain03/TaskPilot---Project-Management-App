import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiUsers, FiAlertTriangle, FiInfo, FiCheck } from 'react-icons/fi';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          API.get('/users'),
          API.get('/projects'),
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        setError('Failed to fetch team members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/users/${deletingUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      showToast('success', `Successfully removed ${deletingUser.name} from the team workspace.`);
      setDeletingUser(null);
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.error || 'Failed to remove user from the team workspace.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FiUsers className="text-violet-400" />
            Team Workspace
          </h2>
          <p className="text-slate-400 text-xs mt-1">View and manage members, project involvement, and system access levels</p>
        </div>
      </div>

      {toast.message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {toast.type === 'success' ? <FiCheck className="text-sm" /> : <FiInfo className="text-sm" />}
          {toast.message}
        </div>
      )}

      {/* Team Table/Grid */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Member Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Access Role</th>
                <th className="p-4">Projects Involved</th>
                {isAdmin && <th className="p-4 pr-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {users.length > 0 ? (
                users.map((member) => {
                  // Count projects involving this user
                  const involvedProjects = projects.filter(
                    (p) => p.createdBy?._id === member._id || p.members.some((m) => m._id === member._id)
                  );

                  let roleBadge = 'bg-slate-850 text-slate-400 border border-slate-800';
                  if (member.role === 'Admin') {
                    roleBadge = 'bg-violet-600/15 text-violet-400 border border-violet-500/25';
                  }

                  const isSelf = member._id === currentUser?._id;

                  return (
                    <tr key={member._id} className="hover:bg-slate-800/20 transition-all">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 uppercase">
                          {member.name[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200">{member.name}</span>
                          {isSelf && <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 font-mono">You</span>}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{member.email}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${roleBadge}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {involvedProjects.length > 0 ? (
                            involvedProjects.slice(0, 3).map((p) => (
                              <span
                                key={p._id}
                                className="text-[10px] bg-slate-800/60 border border-slate-750 text-slate-300 px-2 py-0.5 rounded-full truncate"
                                title={p.title}
                              >
                                {p.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-xs italic">No active projects</span>
                          )}
                          {involvedProjects.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-bold self-center">
                              +{involvedProjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-4 pr-6 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => setDeletingUser(member)}
                              className="p-2 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                              title="Delete Member"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="p-6 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Confirm Member Deletion</h3>
                <p className="text-[10px] text-rose-400/90 uppercase tracking-widest font-bold">Dangerous Action</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-200">{deletingUser.name}</strong> ({deletingUser.email}) from this team workspace?
            </p>
            
            <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl text-xs text-slate-500 space-y-1">
              <p>• They will be removed from all projects they are a member of.</p>
              <p>• All tasks assigned to them will be unassigned.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-350 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <FiTrash2 className="w-3.5 h-3.5" />
                )}
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
