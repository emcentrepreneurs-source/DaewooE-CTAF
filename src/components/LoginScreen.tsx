import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  AlertCircle,
  LogIn,
  KeyRound,
  CheckCircle2,
  UserPlus,
  Mail,
  UserCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { CCS_JV_LOGO_BASE64 } from '../assets/logo';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // New User Registration form
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'coordinator' | 'logistics' | 'user'>('coordinator');
  const [dbUsers, setDbUsers] = useState<UserAccount[]>([]);

  const VALID_USER = 'AdminE&C';
  const VALID_PASS = 'Daewoo2026!';

  // Load existing users from backend
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbUsers(data);
        }
      })
      .catch(err => console.warn('Could not fetch registered users:', err));
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedUser = username.trim();

    // Check if matching root admin or registered user in DB
    const isRootAdmin = trimmedUser.toLowerCase() === VALID_USER.toLowerCase() && password === VALID_PASS;
    const dbUserMatch = dbUsers.find(
      u => (u.uid && u.uid.toLowerCase() === trimmedUser.toLowerCase()) || 
           (u.email && u.email.toLowerCase() === trimmedUser.toLowerCase())
    );

    setTimeout(() => {
      if (isRootAdmin) {
        if (rememberMe) {
          localStorage.setItem('taf_auth_user', VALID_USER);
          localStorage.setItem('taf_auth_timestamp', Date.now().toString());
        } else {
          sessionStorage.setItem('taf_auth_user', VALID_USER);
          sessionStorage.setItem('taf_auth_timestamp', Date.now().toString());
        }
        setIsLoading(false);
        onLoginSuccess(VALID_USER);
      } else if (dbUserMatch) {
        const selectedUid = dbUserMatch.uid || dbUserMatch.displayName || trimmedUser;
        if (rememberMe) {
          localStorage.setItem('taf_auth_user', selectedUid);
          localStorage.setItem('taf_auth_timestamp', Date.now().toString());
        } else {
          sessionStorage.setItem('taf_auth_user', selectedUid);
          sessionStorage.setItem('taf_auth_timestamp', Date.now().toString());
        }
        setIsLoading(false);
        onLoginSuccess(selectedUid);
      } else if (password === VALID_PASS) {
        // Allow login with universal master key for any new username
        if (rememberMe) {
          localStorage.setItem('taf_auth_user', trimmedUser);
          localStorage.setItem('taf_auth_timestamp', Date.now().toString());
        } else {
          sessionStorage.setItem('taf_auth_user', trimmedUser);
          sessionStorage.setItem('taf_auth_timestamp', Date.now().toString());
        }
        setIsLoading(false);
        onLoginSuccess(trimmedUser);
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Please verify your user ID and password.');
      }
    }, 350);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedUid = regUsername.trim();
    const trimmedEmail = regEmail.trim();
    const trimmedDisplayName = regDisplayName.trim() || trimmedUid;

    if (!trimmedUid) {
      setError('Please provide a Username / User ID');
      setIsLoading(false);
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid Email address');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: trimmedUid,
          email: trimmedEmail,
          displayName: trimmedDisplayName,
          role: regRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem('taf_auth_user', trimmedUid);
          localStorage.setItem('taf_auth_timestamp', Date.now().toString());
        } else {
          sessionStorage.setItem('taf_auth_user', trimmedUid);
          sessionStorage.setItem('taf_auth_timestamp', Date.now().toString());
        }
        setIsLoading(false);
        onLoginSuccess(trimmedUid);
      } else {
        setError(data.error || 'Failed to create user');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with database');
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername(VALID_USER);
    setPassword(VALID_PASS);
    setError(null);
  };

  const handleSelectExistingUser = (u: UserAccount) => {
    setUsername(u.uid);
    setPassword(VALID_PASS);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background subtle atmospheric glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Branding Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-zinc-700/60 mb-3 inline-flex items-center justify-center">
              <img
                src={CCS_JV_LOGO_BASE64}
                alt="CCS JV Logo"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <span>CCS JV</span>
              <span className="text-indigo-400">TAF Portal</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
              Mozambique LNG Project — Afungi Site Travel & Accommodation Form System
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add / Register User
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 bg-red-950/70 border border-red-800/80 rounded-xl p-3.5 flex items-start gap-3 text-red-200 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">Authentication Notice</p>
                <p className="mt-0.5 text-red-200/90">{error}</p>
              </div>
            </div>
          )}

          {authMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick Select from Registered DB Users */}
              {dbUsers.length > 0 && (
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>Quick Select User:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pb-1">
                    {dbUsers.map(u => (
                      <button
                        key={u.id || u.uid}
                        type="button"
                        onClick={() => handleSelectExistingUser(u)}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          username.toLowerCase() === u.uid.toLowerCase()
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                            : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {u.displayName || u.uid}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Username / User ID</span>
                  <span className="text-[10px] text-zinc-500 font-normal">e.g. AdminE&C</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. AdminE&C"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Daewoo2026!</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick Credentials Helper */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                  />
                  <span className="text-xs text-zinc-400">Keep me logged in</span>
                </label>

                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline transition-colors font-medium cursor-pointer"
                  title="Fill configured login credentials"
                >
                  <KeyRound className="w-3 h-3" />
                  Fill Credentials
                </button>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to TAF Portal</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register / Add User Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Username / User ID *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. EricMatola or TravelCoordinator"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={e => setRegDisplayName(e.target.value)}
                    placeholder="e.g. Eric Matola"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="e.g. eric.matola@ccsjv.com"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="coordinator">📋 Travel Coordinator</option>
                  <option value="admin">🛡️ Administrator</option>
                  <option value="logistics">✈️ Site Logistics Lead</option>
                  <option value="user">👤 Standard User</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Adding user & logging in...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add User & Enter Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Credentials Info Badge */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>E&C Admin Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Daewoo E&C / CCS JV</span>
            </div>
          </div>
        </div>

        {/* Security / Compliance Notice Footer */}
        <div className="text-center mt-4 text-[11px] text-zinc-500">
          <p>Confidential & Proprietary • Mozambique LNG Afungi Site</p>
          <p className="mt-0.5 text-zinc-600"># Saipem Classification - General Use</p>
        </div>
      </div>
    </div>
  );
};
