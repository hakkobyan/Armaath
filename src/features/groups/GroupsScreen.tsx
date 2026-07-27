import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import {
  deleteTeacherGroup,
  getAllStudents,
  getGroupMembers,
  saveTeacherGroup,
} from "@/services/groups.service";
import type { Group } from "@/types/models";
import { groupSchema } from "@/utils/validation";

type GroupForm = z.infer<typeof groupSchema>;

export function GroupsScreen() {
  const groups = useCurrentGroup();
  const groupIds = groups.data?.map((group) => group.id) ?? [];
  const students = useQuery({
    queryKey: ["all-students"],
    queryFn: getAllStudents,
  });
  const members = useQuery({
    queryKey: ["group-members", groupIds],
    queryFn: () => getGroupMembers(groupIds),
    enabled: groupIds.length > 0,
  });
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editing, setEditing] = useState<Group>();
  const [visible, setVisible] = useState(false);
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", description: "" },
  });
  const memberData = members.data;
  const membersByGroup = useMemo(() => {
    const result = new Map<string, typeof memberData>();
    for (const group of groups.data ?? [])
      result.set(
        group.id,
        memberData?.filter((member) => member.group_id === group.id) ?? [],
      );
    return result;
  }, [groups.data, memberData]);
  const open = (group?: Group) => {
    setEditing(group);
    setSelectedStudents(
      group
        ? (members.data
            ?.filter((member) => member.group_id === group.id)
            .map((member) => member.student_id) ?? [])
        : [],
    );
    form.reset({
      name: group?.name ?? "",
      description: group?.description ?? "",
    });
    setVisible(true);
  };
  const toggleStudent = (id: string) =>
    setSelectedStudents((current) =>
      current.includes(id)
        ? current.filter((studentId) => studentId !== id)
        : [...current, id],
    );
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["teacher-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["group-members"] }),
      queryClient.invalidateQueries({ queryKey: ["student-count"] }),
      queryClient.invalidateQueries({ queryKey: ["schedule"] }),
      queryClient.invalidateQueries({ queryKey: ["chat-room"] }),
    ]);
  };
  const save = useMutation({
    mutationFn: (values: GroupForm) =>
      saveTeacherGroup({
        id: editing?.id,
        name: values.name,
        description: values.description,
        studentIds: selectedStudents,
      }),
    onSuccess: async () => {
      setVisible(false);
      await invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: deleteTeacherGroup,
    onSuccess: invalidate,
  });
  const confirmDelete = (group: Group) =>
    Alert.alert(
      "Delete group",
      `Delete ${group.name}? Its schedule and chat history will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => remove.mutate(group.id),
        },
      ],
    );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>TEACHER SPACE</Text>
          <Text style={styles.title}>Groups</Text>
        </View>
        <Button title="New group" onPress={() => open()} />
      </View>
      {groups.isError || students.isError || members.isError ? (
        <Text style={styles.error}>
          Group data could not be loaded. Apply migration 003 and try again.
        </Text>
      ) : null}
      {!groups.isLoading && !groups.data?.length ? (
        <EmptyState
          title="No groups yet"
          message="Create a group and choose which students belong to it."
        />
      ) : (
        groups.data?.map((group) => {
          const groupMembers = membersByGroup.get(group.id) ?? [];
          return (
            <Card key={group.id}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.muted}>
                    {group.description || "No description"}
                  </Text>
                </View>
                <Text style={styles.count}>{groupMembers.length}</Text>
              </View>
              <Text style={styles.sectionLabel}>STUDENTS</Text>
              {groupMembers.length ? (
                groupMembers.map((member) => (
                  <Text key={member.id}>
                    {member.profiles?.first_name} {member.profiles?.last_name}
                  </Text>
                ))
              ) : (
                <Text style={styles.muted}>No students assigned</Text>
              )}
              <View style={styles.actions}>
                <Pressable onPress={() => open(group)}>
                  <Text style={styles.link}>Edit members</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(group)}>
                  <Text style={styles.danger}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          );
        })
      )}
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <ScreenContainer>
          <Text style={styles.title}>
            {editing ? "Edit group" : "Create group"}
          </Text>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Group name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Robotics Junior"
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Description"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                placeholder="What students will learn"
                error={form.formState.errors.description?.message}
              />
            )}
          />
          <View style={styles.studentHeader}>
            <Text style={styles.groupName}>Choose students</Text>
            <Text style={styles.muted}>{selectedStudents.length} selected</Text>
          </View>
          {students.data?.map((student) => {
            const selected = selectedStudents.includes(student.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={student.id}
                style={[styles.student, selected && styles.studentSelected]}
                onPress={() => toggleStudent(student.id)}
              >
                <View
                  style={[styles.checkbox, selected && styles.checkboxSelected]}
                >
                  <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
                </View>
                <View>
                  <Text style={styles.studentName}>
                    {student.first_name} {student.last_name}
                  </Text>
                  <Text style={styles.muted}>Student</Text>
                </View>
              </Pressable>
            );
          })}
          {!students.isLoading && !students.data?.length ? (
            <EmptyState
              title="No students"
              message="Students will appear here after registration."
            />
          ) : null}
          {save.isError ? (
            <Text style={styles.error}>
              Could not save the group. Make sure migration 003 is applied.
            </Text>
          ) : null}
          <Button
            title={editing ? "Save changes" : "Create group"}
            loading={save.isPending}
            disabled={save.isPending}
            onPress={form.handleSubmit((values) => save.mutate(values))}
          />
          <Button
            title="Close"
            variant="secondary"
            disabled={save.isPending}
            onPress={() => setVisible(false)}
          />
        </ScreenContainer>
      </Modal>
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
    fontSize: 13,
    letterSpacing: 2,
    color: "#5b4cf0",
    fontWeight: "800",
  },
  title: { fontSize: 36, fontWeight: "900" },
  error: { color: "#b42336" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: { flex: 1, gap: 4 },
  groupName: { fontSize: 21, fontWeight: "800" },
  muted: { color: "#686879", fontSize: 15, lineHeight: 22 },
  count: {
    minWidth: 36,
    textAlign: "center",
    padding: 8,
    borderRadius: 18,
    backgroundColor: "#ebe9ff",
    color: "#4436c7",
    fontWeight: "800",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#7164e8",
    marginTop: 6,
  },
  actions: { flexDirection: "row", gap: 22, marginTop: 8 },
  link: { color: "#5142da", fontWeight: "700" },
  danger: { color: "#b42336", fontWeight: "700" },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  student: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e1e0e8",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  studentSelected: { borderColor: "#7164e8", backgroundColor: "#f0eeff" },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#b2b0bd",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#5b4cf0", borderColor: "#5b4cf0" },
  checkmark: { color: "#fff", fontWeight: "900" },
  studentName: { fontSize: 18, fontWeight: "700" },
});
