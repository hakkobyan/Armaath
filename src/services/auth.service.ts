import { supabase } from '@/lib/supabase';
export const signIn=(email:string,password:string)=>supabase.auth.signInWithPassword({email,password});
export const signUpStudent=(input:{email:string;password:string;firstName:string;lastName:string})=>supabase.auth.signUp({email:input.email,password:input.password,options:{data:{first_name:input.firstName,last_name:input.lastName,role:'student'}}});
export const requestPasswordReset=(email:string,redirectTo:string)=>supabase.auth.resetPasswordForEmail(email,{redirectTo});
export const updatePassword=(password:string)=>supabase.auth.updateUser({password});
export const signOut=()=>supabase.auth.signOut();
