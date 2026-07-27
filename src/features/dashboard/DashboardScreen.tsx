import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { colors } from "@/lib/theme";
import { countStudents } from "@/services/groups.service";
import { getSchedule } from "@/services/schedule.service";
import { formatDate, formatTime } from "@/utils/date";

export function DashboardScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const phone = width < 480;
  const { profile } = useAuth();
  const avatar = useAvatarUrl(profile?.avatar_url);
  const router = useRouter();
  const groups = useCurrentGroup();
  const ids = groups.data?.map((group) => group.id) ?? [];
  const schedule = useQuery({
    queryKey: ["schedule", ids],
    queryFn: () => getSchedule(ids),
    enabled: ids.length > 0,
  });
  const students = useQuery({
    queryKey: ["student-count", ids],
    queryFn: () => countStudents(ids),
    enabled: profile?.role === "teacher" && ids.length > 0,
  });
  const upcoming =
    schedule.data?.filter(
      (item) =>
        new Date(item.starts_at) > new Date() && item.status !== "cancelled",
    ) ?? [];
  const next = upcoming[0];
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, desktop && styles.kickerDesktop]}>
            {profile?.role === "teacher" ? "TEACHER SPACE" : "STUDENT SPACE"}
          </Text>
          <Text style={[styles.title, desktop && styles.titleDesktop]}>
            Hi, {profile?.first_name} 👋
          </Text>
          <Text style={[styles.muted, desktop && styles.mutedDesktop]}>
            Ready to build something great?
          </Text>
        </View>
        <View style={[styles.avatar, desktop && styles.avatarDesktop]}>
          {avatar.data ? (
            <Image
              source={{ uri: avatar.data }}
              style={styles.avatarImage}
              resizeMode="cover"
              accessibilityLabel="Profile photo"
            />
          ) : (
            <Text
              style={[styles.avatarText, desktop && styles.avatarTextDesktop]}
            >
              {profile?.first_name?.[0]}
              {profile?.last_name?.[0]}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.stats}>
        <View style={[styles.stat, styles.purple]}>
          <Ionicons
            name="people-outline"
            size={desktop ? 22 : 18}
            color={colors.primary}
          />
          <Text
            style={[styles.statNumber, desktop && styles.statNumberDesktop]}
          >
            {ids.length}
          </Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={[styles.stat, styles.mint]}>
          <Ionicons
            name={
              profile?.role === "teacher"
                ? "person-outline"
                : "calendar-outline"
            }
            size={desktop ? 22 : 18}
            color={colors.mint}
          />
          <Text
            style={[styles.statNumber, desktop && styles.statNumberDesktop]}
          >
            {profile?.role === "teacher"
              ? (students.data ?? 0)
              : upcoming.length}
          </Text>
          <Text style={styles.statLabel}>
            {profile?.role === "teacher" ? "Students" : "Upcoming"}
          </Text>
        </View>
      </View>
      <View style={[styles.mainGrid, desktop && styles.mainGridDesktop]}>
        <View style={styles.mainColumn}>
          {next ? (
            <Card
              tone="coral"
              style={[styles.dashboardCard, desktop && styles.equalCard]}
            >
              <View style={styles.cardHeading}>
                <View
                  style={[styles.roundIcon, desktop && styles.roundIconDesktop]}
                >
                  <Ionicons
                    name="rocket-outline"
                    size={desktop ? 21 : 18}
                    color={colors.coral}
                  />
                </View>
                <Text style={styles.label}>NEXT LESSON</Text>
              </View>
              <Text style={styles.cardTitle}>
                {next.groups?.name ?? next.title}
              </Text>
              <Text style={styles.time}>
                {formatDate(next.starts_at)} · {formatTime(next.starts_at)}
              </Text>
              <Text style={styles.muted}>{next.title}</Text>
            </Card>
          ) : (
            <EmptyState
              style={[styles.dashboardCard, desktop && styles.equalCard]}
              title="No upcoming lessons"
              message="Your next scheduled lesson will appear here."
            />
          )}
        </View>
        <View style={styles.mainColumn}>
          <Card
            tone="purple"
            style={[styles.dashboardCard, desktop && styles.equalCard]}
          >
            <View style={styles.cardHeading}>
              <Ionicons
                name="layers-outline"
                size={desktop ? 22 : 18}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>Your groups</Text>
            </View>
            {groups.data?.map((group) => (
              <View key={group.id} style={styles.groupRow}>
                <View style={styles.groupDot} />
                <View style={styles.groupBody}>
                  <Text style={styles.group}>{group.name}</Text>
                  {group.description ? (
                    <Text style={styles.muted}>{group.description}</Text>
                  ) : null}
                </View>
              </View>
            ))}
            {!groups.data?.length ? (
              <Text style={styles.muted}>No groups assigned yet.</Text>
            ) : null}
          </Card>
        </View>
      </View>
      <View style={[styles.actions, phone && styles.actionsPhone]}>
        <View style={styles.action}>
          <Button
            title="View schedule"
            onPress={() =>
              router.push(
                profile?.role === "teacher"
                  ? "/(teacher)/schedule"
                  : "/(student)/schedule",
              )
            }
          />
        </View>
        <View style={styles.action}>
          <Button
            title="Open chat"
            variant="secondary"
            onPress={() =>
              router.push(
                profile?.role === "teacher"
                  ? "/(teacher)/chat"
                  : "/(student)/chat",
              )
            }
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.7,
    color: colors.primary,
    fontWeight: "900",
  },
  kickerDesktop: { fontSize: 13, letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink, marginTop: 3 },
  titleDesktop: { fontSize: 36 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  mutedDesktop: { fontSize: 16, lineHeight: 23 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarDesktop: { width: 52, height: 52, borderRadius: 18 },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  avatarTextDesktop: { fontSize: 19 },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, borderRadius: 18, padding: 15, gap: 3 },
  purple: { backgroundColor: colors.primarySoft },
  mint: { backgroundColor: colors.mintSoft },
  statNumber: { fontSize: 21, fontWeight: "900", color: colors.ink },
  statNumberDesktop: { fontSize: 29 },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  mainGrid: { gap: 20 },
  mainGridDesktop: { flexDirection: "row", alignItems: "stretch" },
  mainColumn: { flex: 1, minWidth: 0 },
  dashboardCard: { padding: 20 },
  equalCard: { flex: 1 },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  roundIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  roundIconDesktop: { width: 38, height: 38, borderRadius: 19 },
  label: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.coral,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  time: { fontSize: 14, fontWeight: "700", color: colors.ink },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 3,
  },
  groupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.mint,
  },
  groupBody: { flex: 1 },
  group: { fontSize: 15, fontWeight: "700", color: colors.ink },
  actions: { flexDirection: "row", gap: 12 },
  actionsPhone: { flexDirection: "column" },
  action: { flex: 1 },
});
