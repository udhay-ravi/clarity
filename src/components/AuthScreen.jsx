import { useState, useRef } from 'react';
import { PenLine, ArrowLeft, Loader2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AuthScreen({
  onSuccess,
  onBack,
  signInWithEmail,
  signUpWithEmail,
}) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const passwordRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: err } = await signUpWithEmail(email, password);
        if (err) {
          setError(err.message);
        } else {
          setConfirmationSent(true);
        }
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) {
          setError(err.message);
        } else {
          onSuccess();
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-8">
            <PenLine size={28} className="text-amber" />
            <span className="text-2xl font-bold font-[var(--font-ui)] text-text">Clarity</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-8">
            <div className="text-4xl mb-4">&#9993;</div>
            <h2 className="text-lg font-semibold font-[var(--font-ui)] text-text mb-2">Check your email</h2>
            <p className="text-sm font-[var(--font-ui)] text-ghost">
              We sent an activation link to <strong className="text-text">{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
          </div>
          <button
            onClick={() => { setConfirmationSent(false); setMode('signin'); }}
            className="mt-6 text-sm font-[var(--font-ui)] text-amber hover:text-amber/80 transition-colors cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-[var(--font-ui)] text-ghost hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <PenLine size={28} className="text-amber" />
          <span className="text-2xl font-bold font-[var(--font-ui)] text-text">Clarity</span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold font-[var(--font-ui)] text-text text-center mb-8">
          {mode === 'signin' ? 'Sign in to start writing' : 'Create your account'}
        </h1>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium font-[var(--font-ui)] text-ghost mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-[var(--font-ui)] text-text placeholder:text-ghost/40 outline-none focus:border-amber transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium font-[var(--font-ui)] text-ghost mb-1.5">Password</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyDown}
              placeholder={mode === 'signup' ? 'Choose a password' : 'Your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-[var(--font-ui)] text-text placeholder:text-ghost/40 outline-none focus:border-amber transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-[var(--font-ui)] text-red-500">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber text-white rounded-xl text-sm font-semibold font-[var(--font-ui)] hover:bg-amber/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm font-[var(--font-ui)] text-ghost mt-6">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-amber hover:text-amber/80 font-medium transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className="text-amber hover:text-amber/80 font-medium transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}
