import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://glbtwncbpyeylihfniat.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYnR3bmNicHlleWxpaGZuaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODE4MjEsImV4cCI6MjA5MzM1NzgyMX0.br0Cg3SStZsO4ISisxFIVFpYplS3Z7Dyjaz2ITYYfcM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
