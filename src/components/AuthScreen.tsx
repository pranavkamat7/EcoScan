import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C2B24] flex flex-col justify-between selection:bg-[#1E6B4B] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FFFDF8] border-b border-[#E2DCCD] px-4 sm:px-8 py-3.5">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#1E6B4B] text-white flex items-center justify-center font-serif text-base font-bold shadow-subtle flex-shrink-0">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold text-[#1C2B24] tracking-tight leading-none">
                GarbageMedia
              </span>
              <span className="text-[10px] text-[#6B7468] font-sans leading-none mt-0.5">
                Neighbourhood cleanups
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-medium text-[#1C2B24] hover:text-[#1E6B4B] bg-[#FFFDF8] hover:bg-[#F4F1EA] border border-[#E2DCCD] px-3.5 py-1.5 rounded-[6px] transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span>Explore as guest</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1E6B4B]" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Hero Civic Overview */}
          <div className="lg:col-span-7 space-y-5">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C2B24] leading-tight">
              Clean your neighbourhood. <br />
              <span className="text-[#1E6B4B]">
                Capture proof. Earn civic bounty.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B7468] leading-relaxed max-w-lg">
              Found a littered park corner, beach strip, or roadside alley? Snap a photo with live GPS.
              When volunteers clean it up, our community app verifies the before & after proof and awards civic points.
            </p>

            {/* 3 Step Features */}
            <div className="space-y-2.5 pt-2">
              <div className="bg-[#FFFDF8] p-3.5 rounded-[6px] border border-[#E2DCCD] flex items-start gap-3">
                <span className="w-6 h-6 rounded-[4px] bg-[#F4F1EA] text-[#1C2B24] font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-[#E2DCCD]">
                  1
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1C2B24]">Pin a dirty spot on the map</h4>
                  <p className="text-xs text-[#6B7468] mt-0.5 leading-relaxed">
                    Take a photo with live GPS and location name via open street maps.
                  </p>
                </div>
              </div>

              <div className="bg-[#FFFDF8] p-3.5 rounded-[6px] border border-[#E2DCCD] flex items-start gap-3">
                <span className="w-6 h-6 rounded-[4px] bg-[#F4F1EA] text-[#1C2B24] font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-[#E2DCCD]">
                  2
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1C2B24]">Clean & verify on-site</h4>
                  <p className="text-xs text-[#6B7468] mt-0.5 leading-relaxed">
                    Volunteers clean up and snap the after photo on-site. Proximity matching checks proof.
                  </p>
                </div>
              </div>

              <div className="bg-[#FFFDF8] p-3.5 rounded-[6px] border border-[#E2DCCD] flex items-start gap-3">
                <span className="w-6 h-6 rounded-[4px] bg-[#F4F1EA] text-[#1C2B24] font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-[#E2DCCD]">
                  3
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1C2B24]">Interactive proof & community rewards</h4>
                  <p className="text-xs text-[#6B7468] mt-0.5 leading-relaxed">
                    A before & after slider is published live, and reward points are credited to your civic passport.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login / Signup Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] shadow-subtle p-6 space-y-4">
              {/* Card Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DCCD]">
                <h2 className="font-serif text-base font-bold text-[#1C2B24]">
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </h2>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                      mode === 'signin'
                        ? 'bg-[#1E6B4B] text-white'
                        : 'text-[#6B7468] hover:text-[#1C2B24]'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                      mode === 'signup'
                        ? 'bg-[#1E6B4B] text-white'
                        : 'text-[#6B7468] hover:text-[#1C2B24]'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-[6px] bg-[#FDF2F0] border border-[#B3432E]/30 text-xs text-[#B3432E] flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#B3432E]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2 px-3 rounded-[6px] border border-[#E2DCCD] bg-[#FFFDF8] hover:bg-[#F4F1EA] text-[#1C2B24] text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-subtle disabled:opacity-50"
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
                <div className="border-t border-[#E2DCCD] w-full"></div>
                <span className="bg-[#FFFDF8] px-2 text-[11px] text-[#6B7468] absolute">
                  or with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Jordan Vance"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scout@example.com"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-[6px] bg-[#1E6B4B] hover:bg-[#18553B] text-white text-xs font-medium shadow-subtle transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mode === 'signin' ? 'Sign in to account' : 'Register account'}</span>
                </button>
              </form>

              {/* Guest Enter */}
              <div className="pt-2 text-center border-t border-[#E2DCCD]">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full py-2 px-3 text-xs font-medium text-[#1E6B4B] hover:text-[#18553B] hover:bg-[#F4F1EA] rounded-[6px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Skip for now, continue as guest volunteer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1E6B4B]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2DCCD] bg-[#FFFDF8] py-3.5 text-center text-xs text-[#6B7468] px-4">
        GarbageMedia · Grassroots neighbourhood cleanups & verified photographic proofs
      </footer>
    </div>
  );
};
