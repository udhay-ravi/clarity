import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Workspace from './components/Workspace';
import { useAuth } from './hooks/useAuth';
import { migrateIfNeeded, loadIndex } from './lib/storage';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const { user: authUser, loading: authLoading, authEnabled, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const initRef = useRef(false);

  const normalizedUser = useMemo(() => {
    if (!authUser) return null;
    return {
      email: authUser.email,
      displayName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
      photoURL: authUser.user_metadata?.avatar_url || null,
    };
  }, [authUser]);

  // Init: migrate legacy, decide first screen
  useEffect(() => {
    if (authLoading) return;

    if (!initRef.current) {
      initRef.current = true;
      migrateIfNeeded();
    }

    if (authEnabled && !authUser) {
      setScreen('landing');
    } else {
      setScreen('workspace');
    }
  }, [authLoading, authUser, authEnabled]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setScreen('landing');
  }, [signOut]);

  if (screen === 'loading') return null;

  if (screen === 'landing') {
    return (
      <LandingPage
        authEnabled={authEnabled}
        onGetStarted={() => {
          if (authEnabled && !authUser) {
            setScreen('auth');
          } else {
            setScreen('workspace');
          }
        }}
      />
    );
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        onSuccess={() => setScreen('workspace')}
        onBack={() => setScreen('landing')}
        signInWithEmail={signInWithEmail}
        signUpWithEmail={signUpWithEmail}
      />
    );
  }

  if (screen === 'workspace') {
    return (
      <Workspace
        user={normalizedUser}
        authEnabled={authEnabled}
        onSignOut={handleSignOut}
        onGoToLanding={() => setScreen('landing')}
      />
    );
  }

  return null;
}
