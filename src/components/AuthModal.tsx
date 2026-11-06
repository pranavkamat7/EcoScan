import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import {
  Modal,
  Input,
  Button,
} from './ui';

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

  const formatFirebaseError = (err: any): string => {
    const msg = err?.code || err?.message || '';
    if (msg.includes('auth/configuration-not-found')) {
      return 'Firebase Authentication is not activated in your Firebase Console. Please enable "Email/Password" and "Google" sign-in methods.';
    }
    if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. If you do not have an account yet, switch to "Sign up".';
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
      return 'This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.';
    }
    return err?.message || 'Authentication error. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isFirebaseActive) {
        throw new Error('Please configure Firebase keys first to use Google Sign-In.');
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
    setError(null);
    setLoading(true);
    try {
      await loginAsGuest();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not log in as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Sign in to GarbageMedia' : 'Create volunteer account'}
      description={
        mode === 'signin'
          ? 'Log in to track cleanups, claim bounty rewards, and build your civic profile.'
          : 'Join your neighbourhood community to post proofs and earn points.'
      }
      size="sm"
    >
      <div className="space-y-4 text-left">
        {/* Sign in / Sign up Mode Switcher */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`pb-2 text-xs font-semibold flex-1 text-center border-b-2 transition-colors ${
              mode === 'signin'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
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
            className={`pb-2 text-xs font-semibold flex-1 text-center border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-forest text-forest'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-sm bg-coral-subtle border border-coral/30 text-coral text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleGoogleSignIn}
          isLoading={loading}
          icon={
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
          }
        >
          Continue with Google
        </Button>

        <div className="relative flex items-center justify-center py-1">
          <div className="border-t border-border w-full" />
          <span className="bg-surface px-2 text-[11px] text-muted uppercase tracking-wider absolute">
            or with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'signup' && (
            <Input
              label="Full name"
              type="text"
              placeholder="e.g. Ms dhoni"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              startIcon={<UserIcon className="w-3.5 h-3.5" />}
              required
            />
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="scout@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail className="w-3.5 h-3.5" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock className="w-3.5 h-3.5" />}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading}
              icon={<LogIn className="w-4 h-4 text-lime" />}
            >
              {mode === 'signin' ? 'Sign in to account' : 'Create volunteer profile'}
            </Button>
          </div>
        </form>

        {/* Guest & Firebase Config Links */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-muted hover:text-ink underline text-[11px]"
          >
            Skip for now, continue as guest
          </button>

          {onOpenFirebaseConfig && (
            <button
              type="button"
              onClick={onOpenFirebaseConfig}
              className="text-forest hover:underline text-[11px]"
            >
              ⚙️ Firebase setup
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
