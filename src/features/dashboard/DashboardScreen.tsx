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
import { ActionTile } from "@/components/ActionTile";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { colors, spacing } from "@/lib/theme";
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
      <PageHeader
        stackOnPhone={false}
        variant="hero"
        eyebrow={
          profile?.role === "teacher" ? "TEACHER SPACE" : "STUDENT SPACE"
        }
        title={`Hi, ${profile?.first_name ?? "there"}`}
        description="Your groups, lessons, and conversations — all in one place."
        action={
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
        }
      />

      <View style={styles.stats}>
        <View style={[styles.stat, styles.purple]}>
          <View style={[styles.statIcon, styles.statIconPrimary]}>
            <Ionicons
              name="people-outline"
              size={desktop ? 22 : 18}
              color={colors.primary}
            />
          </View>
          <View style={styles.statCopy}>
            <Text
              style={[styles.statNumber, desktop && styles.statNumberDesktop]}
            >
              {ids.length}
            </Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
        </View>
        <View style={[styles.stat, styles.mint]}>
          <View style={[styles.statIcon, styles.statIconSecondary]}>
            <Ionicons
              name={
                profile?.role === "teacher"
                  ? "person-outline"
                  : "calendar-outline"
              }
              size={desktop ? 22 : 18}
              color={colors.mintDark}
            />
          </View>
          <View style={styles.statCopy}>
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
      </View>

      <View style={[styles.mainGrid, desktop && styles.mainGridDesktop]}>
        <View style={[styles.mainColumn, desktop && styles.mainColumnDesktop]}>
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
              icon="calendar-clear-outline"
              title="No upcoming lessons"
              message="Your next scheduled lesson will appear here."
            />
          )}
        </View>
        <View style={[styles.mainColumn, desktop && styles.mainColumnDesktop]}>
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

      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <Ionicons name="flash-outline" size={17} color={colors.coral} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionDescription}>
            Jump back into your work
          </Text>
        </View>
      </View>
      <View style={[styles.actions, phone && styles.actionsPhone]}>
        <ActionTile
          style={!phone && styles.action}
          icon="calendar-outline"
          title="View schedule"
          description="See upcoming lessons and changes"
          onPress={() =>
            router.push(
              profile?.role === "teacher"
                ? "/(teacher)/schedule"
                : "/(student)/schedule",
            )
          }
        />
        <ActionTile
          style={!phone && styles.action}
          icon="chatbubbles-outline"
          title="Open chat"
          description="Continue the conversation"
          tone="warm"
          onPress={() =>
            router.push(
              profile?.role === "teacher"
                ? "/(teacher)/chat"
                : "/(student)/chat",
            )
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarDesktop: { width: 52, height: 52, borderRadius: 18 },
  avatarText: { color: colors.primaryDeep, fontSize: 16, fontWeight: "900" },
  avatarTextDesktop: { fontSize: 19 },
  stats: { flexDirection: "row", gap: 12 },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  purple: { borderTopWidth: 3, borderTopColor: colors.primary },
  mint: { borderTopWidth: 3, borderTopColor: colors.mint },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconPrimary: { backgroundColor: colors.primarySoft },
  statIconSecondary: { backgroundColor: colors.mintSoft },
  statCopy: { gap: 1 },
  statNumber: { fontSize: 21, fontWeight: "900", color: colors.ink },
  statNumberDesktop: { fontSize: 29 },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  mainGrid: { gap: spacing.md },
  mainGridDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.lg,
  },
  mainColumn: { minWidth: 0 },
  mainColumnDesktop: { flex: 1 },
  dashboardCard: { padding: 20 },
  equalCard: { flex: 1 },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  roundIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
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
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coralSoft,
  },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  sectionDescription: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: "row", gap: 12 },
  actionsPhone: { flexDirection: "column" },
  action: { flex: 1 },
});
