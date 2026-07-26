import type{Session}from'@supabase/supabase-js';
import*as Linking from'expo-linking';
import{createContext,useCallback,useEffect,useMemo,useState,type PropsWithChildren}from'react';
import{supabase}from'@/lib/supabase';
import{getProfile}from'@/services/profile.service';
import type{Profile}from'@/types/models';

type AuthValue={session:Session|null;profile:Profile|null;loading:boolean;error:string|null;passwordRecovery:boolean;completePasswordRecovery:()=>void;reload:()=>Promise<void>};
export const AuthContext=createContext<AuthValue|undefined>(undefined);

function recoveryParams(url:string){const query=url.includes('?')?url.split('?')[1].split('#')[0]:'';const hash=url.includes('#')?url.split('#')[1]:'';const params=new URLSearchParams([query,hash].filter(Boolean).join('&'));return{type:params.get('type'),accessToken:params.get('access_token'),refreshToken:params.get('refresh_token'),code:params.get('code')}}

export function AuthProvider({children}:PropsWithChildren){
  const[session,setSession]=useState<Session|null>(null);
  const[profile,setProfile]=useState<Profile|null>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const[passwordRecovery,setPasswordRecovery]=useState(false);
  const load=useCallback(async(next:Session|null)=>{setLoading(true);setError(null);setSession(next);if(!next){setProfile(null);setLoading(false);return}try{const loadedProfile=await getProfile(next.user.id);if(loadedProfile.role!=='student'&&loadedProfile.role!=='teacher')throw new Error('Your account has an invalid role.');setProfile(loadedProfile)}catch(loadError){setError(loadError instanceof Error?loadError.message:'Your profile could not be loaded.');setProfile(null);await supabase.auth.signOut()}finally{setLoading(false)}},[]);

  useEffect(()=>{const handleRecoveryUrl=async(url:string)=>{const params=recoveryParams(url);if(params.type!=='recovery'&&!url.includes('reset-password'))return;setPasswordRecovery(true);if(params.accessToken&&params.refreshToken){await supabase.auth.setSession({access_token:params.accessToken,refresh_token:params.refreshToken})}else if(params.code){await supabase.auth.exchangeCodeForSession(params.code)}};void Linking.getInitialURL().then(url=>{if(url)return handleRecoveryUrl(url)});const linkingSubscription=Linking.addEventListener('url',event=>{void handleRecoveryUrl(event.url)});supabase.auth.getSession().then(({data})=>load(data.session));const{data:{subscription}}=supabase.auth.onAuthStateChange((event,nextSession)=>{if(event==='PASSWORD_RECOVERY')setPasswordRecovery(true);void load(nextSession)});return()=>{subscription.unsubscribe();linkingSubscription.remove()}},[load]);

  const value=useMemo(()=>({session,profile,loading,error,passwordRecovery,completePasswordRecovery:()=>setPasswordRecovery(false),reload:async()=>{const{data}=await supabase.auth.getSession();await load(data.session)}}),[session,profile,loading,error,passwordRecovery,load]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
