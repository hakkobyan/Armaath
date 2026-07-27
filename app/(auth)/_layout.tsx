import { Redirect, Stack } from "expo-router";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
export default function AuthLayout() {
  const { session, profile, loading, passwordRecovery } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session && profile && !passwordRecovery)
    return (
      <Redirect
        href={
          profile.role === "student" ? "/(student)/home" : "/(teacher)/home"
        }
      />
    );
  return <Stack screenOptions={{ headerShown: false }} />;
}
