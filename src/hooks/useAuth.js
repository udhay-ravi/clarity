import { useState, useEffect, useCallback } from 'react';
import { supabase, isAuthEnabled } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthEnabled()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!isAuthEnabled()) return { error: { message: 'Auth not configured' } };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!isAuthEnabled()) return { error: { message: 'Auth not configured' } };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isAuthEnabled()) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    authEnabled: isAuthEnabled(),
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
