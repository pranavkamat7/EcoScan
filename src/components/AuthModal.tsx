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
      setError(err.message || 'Failed to sign in with Google');
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
      setError(err.message || 'Authentication error');
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121424] rounded-2xl border border-[#232845] shadow-modal-dark overflow-hidden my-6 animate-in fade-in zoom-in-95 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#232845] bg-[#0E101D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-glow-purple">
              🌱
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to GarbageMedia' : 'Create Civic Account'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFirebaseActive ? 'bg-violet-400' : 'bg-orange-400'
                  }`}
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  {isFirebaseActive ? 'Firebase Cloud Active' : 'Local Guest Mode'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
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

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#232845] w-full"></div>
            <span className="bg-[#121424] px-2.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 absolute">
              or email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
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
                    placeholder="e.g., Sarah Jenkins"
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
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center text-xs text-slate-400 pt-1">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-violet-400 font-bold hover:underline"
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
                  className="text-violet-400 font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Quick guest option */}
          <div className="pt-2 border-t border-[#232845] flex justify-between items-center text-[11px]">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-slate-400 hover:text-white underline"
            >
              Continue as Guest
            </button>

            {onOpenFirebaseConfig && (
              <button
                type="button"
                onClick={onOpenFirebaseConfig}
                className="text-violet-400 hover:underline font-mono font-medium"
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
