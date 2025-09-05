import { supabase } from './supabase';
import { Farmer } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  farmer?: Farmer;
}

export const signUp = async (email: string, password: string, userData: {
  name: string;
  contact?: string;
  language?: string;
  role?: 'farmer' | 'verifier';
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    // Create farmer profile
    const { error: profileError } = await supabase
      .from('farmers')
      .insert([
        {
          auth_id: data.user.id,
          name: userData.name,
          contact: userData.contact,
          language: userData.language || 'en',
          role: userData.role || 'farmer',
        },
      ]);

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: farmer } = await supabase
    .from('farmers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    farmer: farmer || undefined,
  };
};

export const updateUserProfile = async (updates: Partial<Farmer>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('farmers')
    .update(updates)
    .eq('auth_id', user.id);

  if (error) throw error;
};