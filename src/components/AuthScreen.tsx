import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../firebase/authContext';

interface AuthScreenProps {
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onContinueAsGuest }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFirebaseError = (err: any): string => {
    const msg = err?.code || err?.message || '';
    if (msg.includes('auth/configuration-not-found')) {
      return 'Firebase Authentication is not activated in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method, and click "Enable" on Email/Password and Google.';
    }
    if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. If you do not have an account yet, switch to "Register" above.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email address. Please switch to "Sign In".';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completing.';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      return 'This domain (onrender.com) is not authorized in Firebase. Add garbagemedia.onrender.com to Firebase Console > Authentication > Settings > Authorized domains.';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Network request failed. Please check your internet connection.';
    }
    return err?.message || 'Authentication error. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Please enter your full name');
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem('garbagemedia_guest_session', 'true');
      await loginAsGuest('Guest Volunteer');
      if (onContinueAsGuest) onContinueAsGuest();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#232845] glass-nav-dark px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-glow-purple">
              🌱
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Garbage<span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Media</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 rounded-xl transition-all shadow-glow-orange hover:scale-105 active:scale-95"
          >
            Explore as Guest →
          </button>
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* Left Hero Civic Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Community Spot Cleanups & Proofs
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Clean your community. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Capture proof. Earn rewards.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Found a littered park, dirty street corner, or shoreline? Snap a photo with live GPS.
              When volunteers clean it up, our app automatically generates verified Before & After comparison sliders and awards civic bounty points.
            </p>

            {/* 3 Step Features */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-extrabold shadow-glow-purple">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pin a dirty area on the map</h4>
                  <p className="text-xs text-slate-400">Take a photo with live GPS and place search powered by accurate OpenStreetMap.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-extrabold shadow-glow-purple">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Clean & verify on-site</h4>
                  <p className="text-xs text-slate-400">Volunteers submit the after photo. Haversine GPS matching checks proximity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-extrabold shadow-glow-purple">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Interactive proof & community rewards</h4>
                  <p className="text-xs text-slate-400">Before & After slider is published to the feed, and points are added to the civic leaderboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login / Signup Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#121424] rounded-2xl border border-[#232845] shadow-modal-dark p-6 sm:p-7 space-y-5">
              {/* Card Tabs */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#232845]">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {mode === 'signin'
                      ? 'Sign in to access your civic profile'
                      : 'Join the community cleanup registry'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#0E101D] p-1 rounded-xl text-xs border border-[#232845]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      mode === 'signin'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-purple'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-purple'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#232845] bg-[#0E101D] hover:bg-[#181C33] text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#232845] w-full"></div>
                <span className="bg-[#121424] px-2.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 absolute">
                  or email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Jordan Vance"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0E101D] border border-[#232845] focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scout@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0E101D] border border-[#232845] focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0E101D] border border-[#232845] focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-bold shadow-glow-orange transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign In to Account' : 'Register Account'}</span>
                </button>
              </form>

              {/* Guest Enter */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Skip login and explore as Guest →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#232845] bg-[#0E101D] py-4 text-center text-xs text-slate-500">
        GarbageMedia • Civic Community Cleanups & Verified Photographic Proofs
      </footer>
    </div>
  );
};
