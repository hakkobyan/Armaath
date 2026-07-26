import{Ionicons}from'@expo/vector-icons';
import{Redirect,Tabs}from'expo-router';
import{LoadingScreen}from'@/components/LoadingScreen';
import{useAuth}from'@/hooks/useAuth';
import{colors}from'@/lib/theme';

export default function Layout(){const{session,profile,loading}=useAuth();if(loading)return <LoadingScreen/>;if(!session||!profile)return <Redirect href="/(auth)/login"/>;if(profile.role!=='student')return <Redirect href="/(teacher)/home"/>;return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:'#98A2B3',tabBarStyle:{height:72,paddingTop:8,paddingBottom:10,backgroundColor:'#fff',borderTopColor:'#EAECF0'},tabBarLabelStyle:{fontSize:11,fontWeight:'700'}}}><Tabs.Screen name="home" options={{title:'Home',tabBarIcon:({color,size})=><Ionicons name="home-outline" color={color} size={size}/>}}/><Tabs.Screen name="schedule" options={{title:'Schedule',tabBarIcon:({color,size})=><Ionicons name="calendar-outline" color={color} size={size}/>}}/><Tabs.Screen name="chat" options={{title:'Chat',tabBarIcon:({color,size})=><Ionicons name="chatbubbles-outline" color={color} size={size}/>}}/><Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color,size})=><Ionicons name="person-outline" color={color} size={size}/>}}/></Tabs>}
