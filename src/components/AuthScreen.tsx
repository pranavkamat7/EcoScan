import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck, Sparkles, MapPin, Camera } from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import {
  Card,
  Input,
  Button,
  Badge,
  Logo,
} from './ui';

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
      return 'Firebase Authentication is not activated in your Firebase Console. Please enable "Email/Password" and "Google" sign-in methods.';
    }
    if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. If you do not have an account yet, switch to "Register".';
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
      setError(err?.message || 'Could not continue as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <header className="max-w-shell w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center">
          <Logo size="md" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
        >
          <span>Explore as guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Hero & Auth Split */}
      <main className="max-w-shell w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">
        {/* Left: Civic Manifesto */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <Badge variant="restored" size="md">
            Grassroots Civic Movement
          </Badge>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy tracking-tight leading-[1.15]">
            Clean your community. <br />
            <span className="text-emerald">Capture proof.</span> <br />
            Earn civic rewards.
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-xl leading-relaxed">
            Found a littered corner, dirty beach, or neglected park? Snap a photo with live GPS.
            When volunteers clean it up, our app generates verified Before & After comparison sliders
            and awards community bounty points.
          </p>

          {/* 3 Step Explainer */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-line shadow-sm">
              <span className="w-7 h-7 rounded-full bg-emerald text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-navy">Pin a dirty area on the map</h3>
                <p className="text-xs text-muted">Snap a photo with live GPS and locality search.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-line shadow-sm">
              <span className="w-7 h-7 rounded-full bg-emerald text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-navy">Clean & verify on-site</h3>
                <p className="text-xs text-muted">Submit after photo. Haversine GPS matching confirms proof.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-line shadow-sm">
              <span className="w-7 h-7 rounded-full bg-emerald text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-navy">Interactive proof & civic rewards</h3>
                <p className="text-xs text-muted">A Before & After split slider is published live and points credited.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="lg:col-span-5">
          <Card variant="default" className="p-6 sm:p-8 space-y-5 text-left border-line shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-navy">
                  {mode === 'signin' ? 'Welcome Back' : 'Join GarbageMedia'}
                </h2>
                <div className="flex border border-line rounded-sm p-0.5 bg-navy-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
                      mode === 'signin'
                        ? 'bg-emerald text-white shadow-sm'
                        : 'text-muted hover:text-navy'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
                      mode === 'signup'
                        ? 'bg-emerald text-white shadow-sm'
                        : 'text-muted hover:text-navy'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your personal profile and points.'
                  : 'Create a free volunteer account in 30 seconds.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-sm bg-coral-subtle border border-coral/30 text-coral text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Google One-Click Button */}
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
              <div className="border-t border-line w-full" />
              <span className="bg-white px-2 text-[11px] text-muted uppercase tracking-wider absolute">
                or with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="e.g. Ms dhoni"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  startIcon={<UserIcon className="w-3.5 h-3.5 text-muted" />}
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="scout@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startIcon={<Mail className="w-3.5 h-3.5 text-muted" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startIcon={<Lock className="w-3.5 h-3.5 text-muted" />}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={loading}
                >
                  {mode === 'signin' ? 'Sign In to Account' : 'Create Free Account'}
                </Button>
              </div>
            </form>

            <div className="pt-2 border-t border-line text-center">
              <button
                type="button"
                onClick={handleGuest}
                className="text-xs text-muted hover:text-navy underline"
              >
                Skip for now, continue as Guest Volunteer →
              </button>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-shell w-full mx-auto text-center text-xs text-muted pt-6 border-t border-line">
        <span>GarbageMedia · Grassroots neighbourhood cleanup registry</span>
      </footer>
    </div>
  );
};
