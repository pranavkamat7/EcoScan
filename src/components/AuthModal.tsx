import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../firebase/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFirebaseConfig?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenFirebaseConfig,
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginAsGuest,
    isFirebaseActive,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatFirebaseError = (err: any): string => {
    const msg = err?.code || err?.message || '';
    if (msg.includes('auth/configuration-not-found')) {
      return 'Firebase Authentication is not activated in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method, and enable "Email/Password" and "Google".';
    }
    if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. If you do not have an account yet, switch to "Sign up" below.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email address. Please switch to "Sign in".';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completing.';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      return 'This domain is not authorized in Firebase. Add garbagemedia.onrender.com to Firebase Console > Authentication > Settings > Authorized domains.';
    }
    return err?.message || 'Authentication error. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isFirebaseActive) {
        throw new Error('Please configure your free Firebase keys first to use Google Sign-In.');
      }
      await signInWithGoogle();
      onClose();
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
      if (!isFirebaseActive) {
        await loginAsGuest(displayName || email.split('@')[0]);
        onClose();
        return;
      }

      if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Please enter your name');
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await loginAsGuest('Guest Volunteer');
      onClose();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-horizontal.png"
              alt="GarbageMedia"
              className="h-7 w-auto object-contain"
            />
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {mode === 'signin' ? 'Sign In' : 'Create Civic Account'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[10px] text-slate-500 font-medium">
                  {isFirebaseActive ? 'Firebase Active' : 'Guest Mode'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-50 min-h-[44px]"
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
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 absolute">
              or email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 min-h-[42px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 min-h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 min-h-[42px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-btn-green transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 min-h-[44px]"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center text-xs text-slate-500 pt-1">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Quick guest option */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-slate-500 hover:text-slate-900 underline"
            >
              Continue as Guest
            </button>

            {onOpenFirebaseConfig && (
              <button
                type="button"
                onClick={onOpenFirebaseConfig}
                className="text-emerald-600 hover:underline font-mono font-medium"
              >
                ⚙️ Configure Firebase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
