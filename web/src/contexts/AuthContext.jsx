import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      try {
        console.log('[AuthContext] Calling supabase.auth.getSession()...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('[AuthContext] Session retrieved:', session ? 'User logged in' : 'No session');
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('[AuthContext] Fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        }
        console.log('[AuthContext] Auth initialization complete');
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('[AuthContext] Setting loading to false');
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!email.endsWith('@ncsu.edu')) {
      throw new Error('Only @ncsu.edu email addresses are allowed');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    if (!email.endsWith('@ncsu.edu')) {
      throw new Error('Only @ncsu.edu email addresses are allowed');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
