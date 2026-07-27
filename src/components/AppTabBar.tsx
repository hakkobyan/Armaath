import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBar,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors } from "@/lib/theme";

export function AppTabBar(props: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const [collapsed, setCollapsed] = useState(false);
  const desktop = width >= 900;

  if (!desktop) return <BottomTabBar {...props} />;

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={[styles.brandRow, collapsed && styles.brandRowCollapsed]}>
        {!collapsed ? (
          <View style={styles.brandInline}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>
            <Text style={styles.brand}>ARMATH</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={collapsed ? "Expand menu" : "Collapse menu"}
          style={styles.collapseButton}
          onPress={() => setCollapsed((value) => !value)}
        >
          <Ionicons
            name={collapsed ? "chevron-forward" : "chevron-back"}
            size={22}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.navigation}>
        {props.state.routes.map((route, index) => {
          const focused = props.state.index === index;
          const options = props.descriptors[route.key].options;
          const label = options.title ?? route.name;
          const color = focused ? colors.primary : colors.muted;
          const icon = options.tabBarIcon?.({ focused, color, size: 23 });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={String(label)}
              style={({ pressed }) => [
                styles.item,
                collapsed && styles.itemCollapsed,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
              onPress={() => {
                const event = props.navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() =>
                props.navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                })
              }
            >
              <View style={styles.icon}>{icon}</View>
              {!collapsed ? (
                <Text style={[styles.label, focused && styles.labelActive]}>
                  {String(label)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    height: "100%",
    paddingHorizontal: 14,
    paddingVertical: 22,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: "#25304A",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 4, height: 0 },
  },
  sidebarCollapsed: { width: 72, paddingHorizontal: 8 },
  brandRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  brandRowCollapsed: { justifyContent: "center", paddingHorizontal: 0 },
  brandInline: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  brandMarkText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  collapseButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  navigation: { gap: 4 },
  item: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 14,
    borderRadius: 15,
  },
  itemCollapsed: { justifyContent: "center", paddingHorizontal: 0 },
  itemActive: { backgroundColor: colors.primarySoft },
  itemPressed: { opacity: 0.72 },
  icon: { width: 26, alignItems: "center", justifyContent: "center" },
  label: { color: colors.muted, fontSize: 16, fontWeight: "700" },
  labelActive: { color: colors.primaryDark, fontWeight: "900" },
});
