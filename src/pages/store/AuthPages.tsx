import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';

interface AuthPagesProps {
  mode?: 'login' | 'register' | 'forgot';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode = 'login', navigate }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>(mode);
  const { login, register } = useAuth();
  const { success, error } = useToast();

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      success('Welcome back to Baggio.');
      navigate('/account');
    } catch (err: any) {
      error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      success('Client account created successfully.');
      navigate('/account');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    try {
      const res = await api.forgotPassword({ email: forgotEmail });
      success(res.message);
      setView('reset');
    } catch (err: any) {
      error(err.message || 'Password reset request failed.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        resetCode,
        newPassword,
      });
      success(res.message);
      setView('login');
    } catch (err: any) {
      error(err.message || 'Password reset failed.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xl space-y-6">
        {/* Brand Top */}
        <div className="text-center space-y-1">
          <span className="font-serif font-black text-2xl tracking-widest text-neutral-950 uppercase">
            BAGGIO
          </span>
          <p className="text-xs text-neutral-500 font-medium">
            Florence • Geneva • New York
          </p>
        </div>

        {/* View Switcher Tabs */}
        {(view === 'login' || view === 'register') && (
          <div className="flex border-b border-neutral-100 text-xs font-semibold">
            <button
              onClick={() => setView('login')}
              className={`flex-1 pb-3 transition-colors relative ${
                view === 'login' ? 'text-black font-bold' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Sign In
              {view === 'login' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black"></div>}
            </button>
            <button
              onClick={() => setView('register')}
              className={`flex-1 pb-3 transition-colors relative ${
                view === 'register' ? 'text-black font-bold' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Create Account
              {view === 'register' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black"></div>}
            </button>
          </div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">Password</label>
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-[11px] text-neutral-500 hover:text-black font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Account'}
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('customer@example.com');
                  setLoginPassword('CustomerPass123!');
                }}
                className="w-full py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Sample Customer Credentials</span>
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Leonardo Vance"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="vance@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
            >
              {isRegistering ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Password Assistance</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your registered client email to receive a password reset key.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingReset}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl"
            >
              {isSendingReset ? 'Processing...' : 'Send Reset Instructions'}
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-center text-xs text-neutral-500 hover:text-black pt-2 block"
            >
              ← Return to Sign In
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {view === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Enter New Credentials</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Use reset code <strong className="text-neutral-900">{resetCode || 'BAGGIO-RESET-2026'}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Reset Authorization Code
              </label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingReset}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl"
            >
              {isSendingReset ? 'Updating...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
