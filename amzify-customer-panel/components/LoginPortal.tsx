import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, User, UserPlus, ShoppingBag, Sparkles, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/RealAuthContext';
import { customerApiService } from '../services/customerApi';

const LoginPortal: React.FC = () => {
  const { login, register, isLoading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Forgot / Reset Password states
  const [view, setView] = useState<'auth' | 'forgot' | 'reset'>('auth');
  const [authNotice, setAuthNotice] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [useMockReset, setUseMockReset] = useState(false);

  // Signup step state (for 2-step signup process)
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState('');

  // Reset signup step on mode change
  useEffect(() => {
    setSignupStep(1);
    setFormError('');
  }, [mode]);

  // Detect reset token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetToken(token);
      setView('reset');
    }
  }, []);

  // Validation Functions
  const validateEmail = (emailStr: string): boolean => {
    // Check if email contains uppercase letters
    if (emailStr !== emailStr.toLowerCase()) {
      return false;
    }
    // Check for valid email format with @ and domain
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(emailStr);
  };

  const validatePhoneNumber = (phoneStr: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneStr.replace(/\D/g, ''));
  };

  const validateSignupStep1 = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!firstName.trim()) {
      errors.push('First name is required');
    }

    if (!lastName.trim()) {
      errors.push('Last name is required');
    }

    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Email must be lowercase and valid (e.g., user@example.com)');
    }

    if (phone && !validatePhoneNumber(phone)) {
      errors.push('Phone number must be exactly 10 digits');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const clearResetQuery = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('resetToken');
    window.history.replaceState({}, '', url.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (mode === 'login') {
      // Simple login with email and password
      if (!email.trim()) {
        setFormError('Please enter your email');
        return;
      }
      if (!validateEmail(email)) {
        setFormError('Please enter a valid email address');
        return;
      }
      if (!password) {
        setFormError('Please enter your password');
        return;
      }
      await login({ email, password });
    } else {
      // Two-step signup process
      if (signupStep === 1) {
        // Step 1: Validate name, email, and phone then move to password step
        const validation = validateSignupStep1();
        if (!validation.valid) {
          setFormError(validation.errors[0]);
          return;
        }
        // Proceed to step 2 (password entry)
        setSignupStep(2);
      } else {
        // Step 2: Validate passwords and create account
        if (!password) {
          setFormError('Please enter a password');
          return;
        }
        if (password !== confirmPassword) {
          setFormError('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setFormError('Password must be at least 6 characters');
          return;
        }
        // Create account
        await register({ email, password, firstName, lastName, phone });
      }
    }
  };

  const handleBackToStep1 = () => {
    setSignupStep(1);
    setFormError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      await customerApiService.requestPasswordReset(forgotEmail);
      setForgotMessage('If the email exists, a reset link has been sent.');
    } catch (err) {
      // Fallback mock flow for dev/demo
      const mockToken = btoa(`${forgotEmail}:${Date.now()}`);
      setResetToken(mockToken);
      setUseMockReset(true);
      setForgotMessage('Email service unavailable. Using a mock reset link for demo.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetLoading(true);
    setResetError('');

    try {
      if (useMockReset) {
        setAuthNotice('Password reset successful. Please sign in.');
        setView('auth');
        setMode('login');
      } else {
        await customerApiService.resetPassword(resetToken, newPassword);
        setAuthNotice('Password reset successful. Please sign in.');
        setView('auth');
        setMode('login');
        clearResetQuery();
      }
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reset failed';
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('customer@amzify.com');
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
        {/* Back to Shopping button at top left */}
        <div className="absolute left-6 top-6">
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs shadow-sm border border-slate-200 transition-all"
            onClick={() => window.location.href = '/'}
            type="button"
            aria-label="Back to Shopping"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Shopping
          </button>
        </div>
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

        {/* Forgot Password Flow */}
        {view === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="mb-2 text-center text-indigo-700 font-bold">Reset your password</div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Registered Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="customer@example.com"
                disabled={forgotLoading}
              />
            </div>
            {forgotError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotMessage && (
              <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-xl flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{forgotMessage}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-black hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Send Reset Link
            </button>
            {useMockReset && resetToken && (
              <button
                type="button"
                onClick={() => setView('reset')}
                className="w-full text-indigo-600 font-bold text-sm"
              >
                Continue to Reset (Mock)
              </button>
            )}
            <div className="text-center text-xs text-slate-500">
              <button type="button" onClick={() => setView('auth')} className="hover:text-slate-700">
                Back to Sign In
              </button>
            </div>
          </form>
        ) : view === 'reset' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-2 text-center text-indigo-700 font-bold">Set a new password</div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">New Password</label>
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="••••••••"
                disabled={resetLoading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Confirm New Password</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {showConfirmNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="••••••••"
                disabled={resetLoading}
              />
            </div>
            {resetError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{resetError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-black hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {resetLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Reset Password
            </button>
            <div className="text-center text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setView('auth');
                  setMode('login');
                  clearResetQuery();
                }}
                className="hover:text-slate-700"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    signupStep === 1 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {signupStep === 2 ? '✓' : '1'}
                  </div>
                  <div className={`h-1 w-12 ${
                    signupStep === 2 ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    signupStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    2
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-600">
                  {signupStep === 1 ? 'Enter your details' : 'Create your password'}
                </p>
              </div>
            )}

            {mode === 'register' && signupStep === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:bg-white transition-all ${
                        email && validateEmail(email) ? 'border-green-400 focus:ring-green-500' : 'border-slate-200 focus:ring-indigo-500'
                      } ${email && !validateEmail(email) ? 'border-red-400' : ''}`}
                      placeholder="customer@example.com"
                      disabled={isLoading}
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {validateEmail(email) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {email && !validateEmail(email) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Email must be lowercase with valid format</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:bg-white transition-all ${
                        phone && validatePhoneNumber(phone) ? 'border-green-400 focus:ring-green-500' : 'border-slate-200 focus:ring-indigo-500'
                      } ${phone && !validatePhoneNumber(phone) ? 'border-red-400' : ''}`}
                      placeholder="9876543210"
                      maxLength={10}
                      disabled={isLoading}
                    />
                    {phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {validatePhoneNumber(phone) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {phone && !validatePhoneNumber(phone) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Invalid phone number format</p>
                  )}
                </div>
              </>
            ) : mode === 'register' && signupStep === 2 ? (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                  <div className="text-sm font-bold text-slate-700 mb-1">{firstName} {lastName}</div>
                  <div className="text-xs text-slate-500">{email}</div>
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2"
                  >
                    Edit Details
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">New Password</label>
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showRegisterPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">Confirm Password</label>
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showRegisterConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:bg-white transition-all ${
                        email && validateEmail(email) ? 'border-green-400 focus:ring-green-500' : 'border-slate-200 focus:ring-indigo-500'
                      } ${email && !validateEmail(email) ? 'border-red-400' : ''}`}
                      placeholder="customer@example.com"
                      disabled={isLoading}
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {validateEmail(email) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {email && !validateEmail(email) && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Email must be lowercase with valid format (e.g., user@example.com)</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setForgotEmail(email);
                      setForgotError('');
                      setForgotMessage('');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
            {formError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}
            {authNotice && (
              <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-xl flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{authNotice}</span>
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
                mode === 'login' ? 'Sign In' : (signupStep === 1 ? 'Continue to Password' : 'Create Account')
              )}
            </button>
          </form>
        )}

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