# Supabase database

Run all SQL files in `migrations` in numeric order in a new Supabase project's SQL Editor. They create UUID-based tables and secure `security definer` helpers whose `search_path` is fixed. RLS is enabled on every application table.

Students can see only their groups, related people, schedules, rooms, and messages. Teachers can see and manage only groups they own, including memberships and lessons. A message can be inserted only with the signed-in user as sender. Updates are restricted to soft deletion by the author or owning teacher. Profiles reject self-service role changes at the database trigger level.

Migration `003_teacher_group_management.sql` lets authenticated teachers browse registered student profiles and exposes an atomic `save_teacher_group` function. The function validates the caller's teacher role, validates every selected student, creates one chat room for new groups, and replaces membership only for teacher-owned groups.

Migration `004_global_chat_attachments.sql` adds one global room available to all students (with teachers able to moderate), attachment metadata on messages, and a private `chat-attachments` Storage bucket. Object paths contain the room and uploader IDs. Storage RLS checks room access for every upload/download, limits files to 10 MB, and signed URLs expire after one hour.

Migration `005_chat_and_delete_permissions.sql` repairs the global chat setup, recreates the private attachment bucket policies, grants teachers deletion access only to groups they own, and permits hard deletion of messages by their author or by a teacher moderating an accessible room.

The Auth trigger creates a profile from `first_name` and `last_name` metadata. Every newly registered account is assigned `student` at the database level, so a modified client cannot self-assign `teacher`. Administrators promote teacher profiles explicitly after creating them. Public email registration must be enabled for the student registration screen.

For sample data, create Auth users first, replace the three placeholder UUIDs in `seed.sql`, and run it. Auth users are deliberately not created in seed SQL. Never expose the service-role key to Expo.

Realtime must include `public.messages` in the `supabase_realtime` publication. The migration does this; confirm under Database > Publications if your project reports it already exists. Test policies with separate student and teacher JWTs before production, especially after any schema change.

Password recovery uses Supabase Auth redirect links and does not require a database migration. Add the web, Expo Go, and `armath://**` callback patterns documented in the root README under Authentication > URL Configuration.
