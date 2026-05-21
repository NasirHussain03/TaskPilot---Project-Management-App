import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiAlignLeft, FiLock, FiEdit2, FiCheck, FiX, FiInfo } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create request payload (exclude empty password)
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
      }

      const { data } = await API.put('/users/profile', payload);
      
      // Update local storage and AuthContext state
      updateUser(data);
      
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setForm((prev) => ({ ...prev, password: '' })); // clear password input field
      
      // Clear success alert after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      address: user?.address || '',
    });
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <FiUser className="text-violet-400" />
          My Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage your account profile details, contact information, and security credentials.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Top Banner / User Avatar */}
        <div className="relative h-32 bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex items-end">
          <div className="absolute right-6 top-6">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-slate-950/40 text-violet-200 border border-violet-500/20 backdrop-blur-md">
              {user?.role} Account
            </span>
          </div>

          <div className="flex items-center gap-4 translate-y-10">
            <div className="h-20 w-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-3xl text-violet-400 shadow-2xl uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold text-slate-100 drop-shadow-md">{user?.name}</h3>
              <p className="text-xs text-slate-300 drop-shadow-md">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Form / details */}
        <form onSubmit={handleSave} className="p-6 pt-16 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <FiInfo className="shrink-0 text-sm" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <FiCheck className="shrink-0 text-sm" />
              {success}
            </div>
          )}

          {/* Section 1: Account Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Specifications</h4>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/25 border border-violet-500/20 text-violet-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <FiEdit2 className="w-3 h-3" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">User ID</label>
                <div className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono select-all">
                  {user?._id}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">System Role</label>
                <div className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400 font-semibold uppercase">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Personal & Contact Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-slate-100 placeholder-slate-600"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-slate-100 placeholder-slate-600"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-slate-100 placeholder-slate-600"
                    placeholder="Provide phone number"
                  />
                </div>
              </div>

              {/* Home/Office Address */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-slate-100 placeholder-slate-600"
                    placeholder="Provide permanent or office address"
                  />
                </div>
              </div>

              {/* Bio description */}
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Biography</label>
                <div className="relative">
                  <FiAlignLeft className="absolute left-3.5 top-3.5 text-slate-500 text-sm" />
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-slate-100 placeholder-slate-600 resize-none"
                    placeholder="Write a small professional description about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Credentials / Password */}
          {isEditing && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Security Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">New Password (optional)</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-600"
                      placeholder="Minimum 6 characters"
                      minLength="6"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <FiX className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <FiCheck className="w-3.5 h-3.5" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
