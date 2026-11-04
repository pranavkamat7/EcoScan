import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, Sparkles, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
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
      return 'Invalid email or password. If you do not have an account yet, click "Register" above.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email address. Please click "Sign In".';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-btn-purple">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none block">
                  Garbage<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">Media</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 hidden sm:inline">
                  Civic Proof
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:block font-medium mt-0.5">
                Community Spot Cleanups & Verified Proofs
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-bold text-slate-700 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Explore as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Hero Civic Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Community Spot Cleanups & Proofs
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Clean your community. <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                Capture proof. Earn rewards.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Found a littered park, dirty street corner, or shoreline? Snap a photo with live GPS.
              When volunteers clean it up, our app automatically generates verified Before & After comparison sliders and awards civic bounty points.
            </p>

            {/* 3 Step Features */}
            <div className="space-y-3.5 pt-2">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4 hover:border-purple-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-black shadow-btn-purple">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Pin a dirty area on the map</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Take a photo with live GPS and place search powered by OpenStreetMap reverse geocoding.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4 hover:border-purple-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-black shadow-btn-purple">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Clean & verify on-site</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Volunteers clean the area and submit the after photo. Haversine GPS matching confirms proof.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4 hover:border-purple-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-black shadow-btn-purple">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Interactive proof & civic rewards</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    A Before & After split slider is published live, and reward points are credited to your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login / Signup Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-modal p-6 sm:p-8 space-y-6">
              {/* Card Tabs */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Civic Account'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'signin'
                      ? 'Sign in to access your personal profile'
                      : 'Join the community cleanup registry'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200/80 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      mode === 'signin'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
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
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-xs disabled:opacity-50 hover:border-slate-300 active:scale-95 min-h-[46px]"
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
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase font-mono tracking-wider text-slate-400 absolute">
                  or with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Jordan Vance"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scout@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 placeholder:text-slate-400 min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-extrabold shadow-btn-orange transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 min-h-[46px]"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign In to Account' : 'Register Account'}</span>
                </button>
              </form>

              {/* Guest Enter */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full py-2.5 px-3 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Skip for now, continue as Guest Volunteer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 px-4">
        GarbageMedia • Civic Community Cleanups & Verified Photographic Proofs
      </footer>
    </div>
  );
};
