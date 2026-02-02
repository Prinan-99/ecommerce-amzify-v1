
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, AccountStatus } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    
    // Simulate API authentication call
    // Credentials: admin@nexus.com / admin123
    if (email === 'admin@nexus.com' && password === 'admin123') {
      login('fake_jwt_token', {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@nexus.com',
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        createdAt: new Date().toISOString()
      });
      // Redirect happens via useEffect
    } else {
      setIsError(true);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@nexus.com');
    setPassword('admin123');
    setIsError(false);
    
    // Immediate login for demo convenience
    login('fake_jwt_token', {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@nexus.com',
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 bg-blue-600 rounded-xl mb-4 text-white flex items-center justify-center text-2xl font-bold">N</div>
          <h1 className="text-2xl font-bold text-slate-900">Nexus Console</h1>
          <p className="text-slate-500">Administrator Authentication</p>
        </div>

        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center space-x-2 animate-shake">
            <span>⚠️</span>
            <span>Invalid credentials. Use demo account below.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="admin@nexus.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:transform active:scale-95"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-6">
          <button 
            onClick={handleDemoLogin}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all border border-slate-200 text-sm flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>Quick Demo Login</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
          Restricted Administrative System<br/>
          Unauthorized access attempts are logged.
        </div>
      </div>
    </div>
  );
};

export default Login;
