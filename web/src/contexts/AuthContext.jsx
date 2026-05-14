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
      console.log('[AuthContext] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('livetime_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[AuthContext] Profile not found, creating basic profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('livetime_profiles')
            .insert({
              id: userId,
              interests: [],
              preferences: {
                event_radius: 5,
                preferred_times: [],
                show_live_first: true
              }
            })
            .select()
            .single();

          if (createError) {
            console.error('[AuthContext] Error creating profile:', createError);
            setProfile(null);
          } else {
            console.log('[AuthContext] Profile created successfully');
            setProfile(newProfile);
          }
        } else {
          throw error;
        }
      } else {
        console.log('[AuthContext] Profile fetched successfully');
        setProfile(data);
      }
    } catch (err) {
      console.error('[AuthContext] Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      
      try {
        console.log('[AuthContext] Calling supabase.auth.getSession()...');
        
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (!isMounted) {
          console.log('[AuthContext] Component unmounted, skipping state updates');
          return;
        }
        
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
        setLoading(false);
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    if (!email.endsWith('@ncsu.edu')) {
      throw new Error('Only @ncsu.edu email addresses are allowed');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
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
