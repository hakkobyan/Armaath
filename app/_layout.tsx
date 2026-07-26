import{Stack}from'expo-router';import{StatusBar}from'expo-status-bar';import{AuthProvider}from'@/providers/AuthProvider';import{QueryProvider}from'@/providers/QueryProvider';
export default function RootLayout(){return <QueryProvider><AuthProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false}}/></AuthProvider></QueryProvider>}
