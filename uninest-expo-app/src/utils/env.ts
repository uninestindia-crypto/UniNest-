import Constants from 'expo-constants';

function readExtra(key: string) {
  const extra = Constants.expoConfig?.extra ?? {};
  const value = extra[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  const envValue = process.env[`EXPO_PUBLIC_${key}`];
  if (typeof envValue === 'string' && envValue.length > 0) {
    return envValue;
  }
  throw new Error(`Missing environment variable: ${key}`);
}

export const SUPABASE_URL = readExtra('SUPABASE_URL');
export const SUPABASE_ANON_KEY = readExtra('SUPABASE_ANON_KEY');
