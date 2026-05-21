import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="text-slate-400">You do not have the required permissions to view this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white transition-all shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
