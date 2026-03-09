import { useState } from 'react';
import { PenLine, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onSignInWithGoogle, onSignUpWithEmail, onSignInWithEmail, error }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);

  const displayError = error || localError;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setLocalError('Please enter your name.');
          setLoading(false);
          return;
        }
        await onSignUpWithEmail(email, password, name.trim());
      } else {
        await onSignInWithEmail(email, password);
      }
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setLocalError('An account with this email already exists. Try signing in.');
      } else if (code === 'auth/invalid-email') {
        setLocalError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setLocalError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setLocalError('Invalid email or password.');
      } else {
        setLocalError(err.message || 'Authentication failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="flex items-center gap-3 mb-4">
        <PenLine className="w-10 h-10 text-amber" />
        <h1 className="font-[var(--font-ui)] text-4xl font-bold tracking-tight text-text">
          Clarity
        </h1>
      </div>

      <p className="font-[var(--font-ui)] text-sm text-text/60 mb-10">
        AI-powered writing assistant for PMs
      </p>

      <div className="w-full max-w-sm space-y-4">
        {/* Google Sign-in */}
        <button
          onClick={onSignInWithGoogle}
          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:border-amber/40 transition-all cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="font-[var(--font-ui)] text-sm font-medium text-text">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-[var(--font-ui)] text-ghost">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full text-sm font-[var(--font-ui)] text-text bg-white border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full text-sm font-[var(--font-ui)] text-text bg-white border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full text-sm font-[var(--font-ui)] text-text bg-white border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-amber text-white font-[var(--font-ui)] font-semibold text-sm rounded-xl hover:bg-amber/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Please wait...'
            ) : mode === 'signup' ? (
              <>Create Account <ArrowRight size={16} /></>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-xs font-[var(--font-ui)] text-ghost">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setLocalError(null); }}
                className="text-amber hover:text-amber/80 font-medium cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setLocalError(null); }}
                className="text-amber hover:text-amber/80 font-medium cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {displayError && (
        <p className="mt-4 text-sm font-[var(--font-ui)] text-red-500 text-center max-w-sm">
          {displayError}
        </p>
      )}

      <p className="mt-8 text-xs font-[var(--font-ui)] text-ghost/50 max-w-xs text-center leading-relaxed">
        Your documents are stored locally in your browser. Sign in to access the app.
      </p>
    </div>
  );
}
