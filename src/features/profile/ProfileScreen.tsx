import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { signOut } from "@/services/auth.service";
export function ProfileScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { profile, session } = useAuth();
  const groups = useCurrentGroup();
  return (
    <ScreenContainer>
      <Text style={[styles.title, desktop && styles.titleDesktop]}>
        Profile
      </Text>
      <Card>
        <Text style={styles.name}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={styles.body}>{session?.user.email}</Text>
        <Text style={styles.role}>{profile?.role.toUpperCase()}</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>
          {profile?.role === "teacher" ? "Assigned groups" : "Groups"}
        </Text>
        {groups.data?.map((g) => (
          <Text key={g.id} style={styles.body}>
            • {g.name}
          </Text>
        ))}
        {!groups.data?.length ? (
          <Text style={styles.body}>No groups assigned.</Text>
        ) : null}
      </Card>
      <Button title="Log out" variant="danger" onPress={() => void signOut()} />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: "900" },
  titleDesktop: { fontSize: 36 },
  name: { fontSize: 22, fontWeight: "800" },
  role: { color: "#5b4cf0", fontSize: 15, fontWeight: "800" },
  heading: { fontSize: 21, fontWeight: "800" },
  body: { fontSize: 15, lineHeight: 22 },
});
