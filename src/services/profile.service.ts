import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/models';
export async function getProfile(id:string){const {data,error}=await supabase.from('profiles').select('*').eq('id',id).single(); if(error)throw error; return data as Profile}
