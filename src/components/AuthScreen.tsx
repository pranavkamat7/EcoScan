import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
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
      return 'Authentication is not turned on yet in your Firebase Console. Go to Firebase Console > Build > Authentication, click "Get started", and enable Email/Password and Google under "Sign-in method".';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      return 'Domain not authorized. Go to Firebase Console > Authentication > Settings > Authorized domains, and add "garbagemedia.onrender.com".';
    }
    if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. If you do not have an account, click "Register" above.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email. Please click "Sign In" above.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completing.';
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
      await loginAsGuest('Guest Volunteer');
      if (onContinueAsGuest) onContinueAsGuest();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#181A19] flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="border-b border-[#E3E3DC] bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#2D513B] text-white flex items-center justify-center font-bold text-base shadow-sm">
              🌱
            </div>
            <span className="font-bold text-lg text-[#181A19] tracking-tight">
              GarbageMedia
            </span>
          </div>
          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-medium text-[#535A55] hover:text-[#181A19] underline"
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-[#233F2E] text-xs font-semibold border border-[#2D513B]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#2D513B]" />
              Community Spot Cleanups & Proofs
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181A19] leading-tight">
              Clean your neighborhood. <br className="hidden sm:block" />
              Capture proof. Earn rewards.
            </h1>

            <p className="text-sm sm:text-base text-[#535A55] leading-relaxed max-w-xl">
              Found a littered park, dirty street corner, or alleyway? Snap a photo with live GPS.
              When anyone cleans it up and takes the after photo on-site, our app automatically
              generates the before & after comparison and awards civic points.
            </p>

            {/* 3 Step Features */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2D513B] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#181A19]">Spot a dirty area</h4>
                  <p className="text-xs text-[#535A55]">Upload photo with automatic live GPS location coordinates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2D513B] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#181A19]">Clean & verify on-site</h4>
                  <p className="text-xs text-[#535A55]">Clean the area, take the after photo. Location matches to confirm proof.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2D513B] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#181A19]">Interactive proof & points</h4>
                  <p className="text-xs text-[#535A55]">Generate a split slider comparison and earn civic points on the community leaderboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login / Signup Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-[#E3E3DC] shadow-card p-6 sm:p-7 space-y-5">
              {/* Card Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                <div>
                  <h2 className="text-base font-bold text-[#181A19]">
                    {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
                  </h2>
                  <p className="text-xs text-[#7E8681]">
                    {mode === 'signin'
                      ? 'Sign in to access your civic profile'
                      : 'Join the community cleanup registry'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#F2F2EC] p-0.5 rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      mode === 'signin'
                        ? 'bg-white text-[#181A19] shadow-sm'
                        : 'text-[#535A55]'
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
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      mode === 'signup'
                        ? 'bg-white text-[#181A19] shadow-sm'
                        : 'text-[#535A55]'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-md bg-[#FDEEEA] border border-[#C24A2C]/30 text-xs text-[#842D18] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google 1-Click Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md border border-[#E3E3DC] bg-white hover:bg-[#F9F9F6] text-[#181A19] text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
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

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E3E3DC] w-full"></div>
                <span className="bg-white px-2.5 text-[10px] uppercase font-mono tracking-wider text-[#7E8681] absolute">
                  or with email
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#7E8681] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., Sarah Jenkins"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7E8681] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scout@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C302D] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7E8681] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md bg-[#2D513B] text-white text-xs font-semibold hover:bg-[#233F2E] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign In to App' : 'Create Account'}</span>
                </button>
              </form>

              {/* Bottom Guest Option */}
              <div className="text-center pt-2 border-t border-[#F0EFEA]">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="text-xs text-[#535A55] hover:text-[#181A19] underline font-medium"
                >
                  Skip for now, continue as Guest Volunteer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E3DC] bg-white py-4 text-center text-xs text-[#7E8681]">
        GarbageMedia — Community Cleanups & Verified Proofs
      </footer>
    </div>
  );
};

