import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AppTabBar } from "@/components/AppTabBar";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/lib/theme";

export default function Layout() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { session, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!session || !profile) return <Redirect href="/(auth)/login" />;
  if (profile.role !== "teacher") return <Redirect href="/(student)/home" />;
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: desktop ? "left" : "bottom",
        tabBarLabelPosition: desktop ? "beside-icon" : "below-icon",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#667085",
        tabBarActiveBackgroundColor: desktop
          ? colors.primarySoft
          : "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarStyle: desktop
          ? {
              width: 232,
              paddingHorizontal: 14,
              paddingTop: 28,
              paddingBottom: 28,
              backgroundColor: "#fff",
              borderRightColor: "#EAECF0",
              borderRightWidth: 1,
              shadowColor: "#25304A",
              shadowOpacity: 0.06,
              shadowRadius: 18,
            }
          : {
              height: 72,
              paddingTop: 8,
              paddingBottom: 10,
              backgroundColor: "#fff",
              borderTopColor: "#EAECF0",
            },
        tabBarItemStyle: desktop
          ? {
              maxHeight: 52,
              borderRadius: 14,
              marginVertical: 3,
              outlineWidth: 0,
            }
          : {},
        tabBarLabelStyle: { fontSize: desktop ? 16 : 12, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
