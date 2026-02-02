import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';

const LoginPortal: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail('admin@amzify.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full mb-4 text-white flex items-center justify-center text-2xl mx-auto">
            <span className="font-black">A</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Amzify Admin Panel</h2>
          <p className="text-slate-500">Sign in to manage the platform</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center space-x-2 mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="admin@amzify.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In as Admin'
            )}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all border border-slate-200 text-sm flex items-center justify-center space-x-2"
          >
            <span>🔐</span>
            <span>Demo Admin Login</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 mt-6">
          Super administrator access only. Contact system administrator for access.
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;