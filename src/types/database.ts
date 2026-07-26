import type { ChatRoom, Group, GroupMember, Message, Profile, ScheduleItem } from './models';
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row:Row; Insert:Insert; Update:Update; Relationships:[] };
export interface Database { public:{ Tables:{ profiles:Table<Profile>; groups:Table<Group>; group_members:Table<GroupMember>; schedule_items:Table<ScheduleItem>; chat_rooms:Table<ChatRoom>; messages:Table<Message> }; Views:Record<string,never>; Functions:Record<string,never>; Enums:Record<string,never>; CompositeTypes:Record<string,never> } }
