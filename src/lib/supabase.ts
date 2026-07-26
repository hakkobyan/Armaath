import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if(!url||!key) console.warn('Supabase environment variables are missing. Copy .env.example to .env.');
export const supabase=createClient(url??'https://example.supabase.co',key??'missing-anon-key',{auth:{storage:AsyncStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
