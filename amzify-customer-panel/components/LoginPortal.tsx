import React, { useState } from 'react';
import { AlertTriangle, Loader2, User, UserPlus, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';

const LoginPortal: React.FC = () => {
  const { login, register, isLoading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      await login({ email, password });
    } else {
      if (password !== confirmPassword) {
        return; // Handle password mismatch
      }
      await register({ email, password, firstName, lastName, phone });
    }
  };

  const handleDemoLogin = () => {
    setEmail('customer@example.com');
    setPassword('customer123');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl border border-slate-200/50 shadow-2xl shadow-indigo-500/10 max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {mode === 'login' ? 'Welcome Back' : 'Join Amzify'}
          </h2>
          <p className="text-slate-600 flex items-center justify-center gap-2">
            {mode === 'login' ? (
              <>Continue your shopping journey</>
            ) : (
              <>Start shopping with <Sparkles className="w-4 h-4 text-indigo-500" /> AI assistance</>
            )}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mb-6 shadow-inner">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'login' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'register' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl flex items-center space-x-2 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="+91 9876543210"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="customer@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-indigo-200 text-indigo-700 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm flex items-center justify-center space-x-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try Demo Login</span>
          </button>
          <p className="text-center text-xs text-slate-500 mt-4">
            Experience Amzify with AI-powered shopping
          </p>
        </div>

        <div className="text-center text-xs text-slate-400 mt-6">
          {mode === 'login' ? (
            <>Don't have an account? Click "Sign Up" above to create one.</>
          ) : (
            <>Already have an account? Click "Sign In" above to login.</>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;