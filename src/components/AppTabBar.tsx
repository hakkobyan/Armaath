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
import { colors, radii, shadows } from "@/lib/theme";

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
            color={colors.onPrimaryMuted}
          />
        </Pressable>
      </View>

      <View style={styles.navigation}>
        {props.state.routes.map((route, index) => {
          const focused = props.state.index === index;
          const options = props.descriptors[route.key].options;
          const label = options.title ?? route.name;
          const color = focused ? colors.primary : colors.onPrimaryMuted;
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
              {focused ? <View style={styles.activeIndicator} /> : null}
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
    width: 240,
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.primaryDeep,
    borderRightWidth: 1,
    borderRightColor: colors.primary,
    ...shadows.card,
  },
  sidebarCollapsed: { width: 80, paddingHorizontal: 10 },
  brandRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  brandRowCollapsed: { justifyContent: "center", paddingHorizontal: 0 },
  brandInline: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  brandMarkText: {
    color: colors.primaryDeep,
    fontSize: 19,
    fontWeight: "900",
  },
  collapseButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryRaised,
  },
  navigation: { gap: 6 },
  item: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  itemCollapsed: { justifyContent: "center", paddingHorizontal: 0 },
  itemActive: { backgroundColor: colors.surface },
  itemPressed: { opacity: 0.72 },
  activeIndicator: {
    position: "absolute",
    left: 0,
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  icon: { width: 26, alignItems: "center", justifyContent: "center" },
  label: { color: colors.onPrimaryMuted, fontSize: 16, fontWeight: "700" },
  labelActive: { color: colors.primaryDark, fontWeight: "900" },
});
