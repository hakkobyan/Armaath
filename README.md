# Armath Tbilisi

A minimal Expo mobile app for Armath students and teachers. It provides public student registration, persistent email/password authentication, teacher group/member management, group schedules, realtime group/global chat, private file and image attachments, and Supabase-enforced access control.

## Stack

Expo 54, React Native, TypeScript, Expo Router, Supabase Auth/Postgres/Realtime/RLS, AsyncStorage, TanStack Query, React Hook Form, and Zod.

## Prerequisites and installation

Install Node.js 20+ and the Expo Go app or a native simulator, then:

```bash
npm install
copy .env.example .env
npx expo start
```

Run quality checks with `npm run lint` and `npm run typecheck`.

## Supabase setup

1. Create a project at Supabase and copy its Project URL and publishable/anon key into `.env`:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

2. In SQL Editor, run every file in `supabase/migrations` in numeric order. These create all tables, constraints, indexes, profile trigger, helper functions, RLS policies, secure student registration, teacher group management, the global chat, and the private attachment bucket. The initial migration also adds `messages` to the Realtime publication. If already added, omit its final `alter publication` statement.
3. In Authentication > Providers, enable Email and allow new user sign-ups. Choose whether email confirmation is required. Never put a service-role key in the app.
4. Students can register from the app. The database trigger always assigns them the `student` role, regardless of client metadata. Create teacher accounts in Authentication > Users and promote their generated profile to `teacher` using SQL; role assignment must be administrator-controlled.
5. Copy their UUIDs into the three variables at the beginning of `supabase/seed.sql`, replacing the obvious placeholder UUIDs, then run that file in SQL Editor.

### Password recovery redirect URLs

In Authentication > URL Configuration, add the redirect URLs used during development and production:

```text
http://localhost:8081/**
http://127.0.0.1:8081/**
exp://**
armath://**
```

`exp://**` is for Expo Go development. `armath://**` uses the custom scheme configured in `app.json` for development/production builds. Restrict these patterns to the exact production URLs before release. Recovery links open `/reset-password`, establish a temporary recovery session, and then update the password through `supabase.auth.updateUser`.

Suggested accounts: `teacher@armath-tbilisi.test`, `student1@armath-tbilisi.test`, and `student2@armath-tbilisi.test`. Test each account by logging in, confirming it lands in the correct tab area, and verifying the teacher can mutate lessons and moderate messages while students have read-only schedules.

## Structure

```text
app/                 Expo Router auth, student, and teacher routes
src/components/      Reusable UI primitives
src/features/        Dashboard, schedule, chat, and profile screens
src/hooks/           Auth/profile/group hooks
src/lib/             Supabase and Query clients
src/providers/       Session and query providers
src/services/        Typed data operations
src/types/            Database/domain types
supabase/migrations/ Schema and RLS
supabase/seed.sql     Development sample data
```

## Security and behavior

The root session check waits before redirecting, and Supabase persists/refreses sessions in AsyncStorage. Both role layouts reject the wrong role. UI visibility is only a convenience: RLS is authoritative for profiles, groups, memberships, schedules, rooms, and messages. Realtime subscribes only to the selected room and cleans up on room change/unmount.

Handwritten database types live in `src/types/database.ts`. Replace them after schema changes using `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts`, then update the client import.

## MVP limitations

No social login, admin UI, direct messages, notifications, attendance, assignments, grades, video, advanced moderation, multi-branch support, or store submission. Chat attachments are limited to 10 MB and use one-hour signed download URLs. Production work should also add malware scanning, thumbnail generation, automated RLS integration tests, error monitoring, accessibility/device QA, and EAS build profiles.
