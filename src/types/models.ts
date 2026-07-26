export type UserRole = 'student' | 'teacher';
export type ScheduleStatus = 'scheduled' | 'changed' | 'cancelled' | 'completed';
export interface Profile { id:string; first_name:string; last_name:string; role:UserRole; avatar_url:string|null; created_at:string; updated_at:string }
export interface Group { id:string; name:string; description:string|null; teacher_id:string; created_at:string; updated_at:string }
export interface GroupMember { id:string; group_id:string; student_id:string; created_at:string }
export interface GroupMemberWithProfile extends GroupMember { profiles:Pick<Profile,'id'|'first_name'|'last_name'>|null }
export interface ScheduleItem { id:string; group_id:string; teacher_id:string; title:string; description:string|null; room:string|null; starts_at:string; ends_at:string; status:ScheduleStatus; created_at:string; updated_at:string; groups?:Pick<Group,'name'>; profiles?:Pick<Profile,'first_name'|'last_name'> }
export type ChatRoomType='group'|'global';
export interface ChatRoom { id:string; group_id:string|null; name:string; created_by:string|null; room_type:ChatRoomType; created_at:string }
export interface Message { id:string; chat_room_id:string; sender_id:string; content:string; reply_to_id:string|null; is_deleted:boolean; attachment_path:string|null; attachment_name:string|null; attachment_type:string|null; attachment_size:number|null; attachment_url?:string|null; created_at:string; updated_at:string; profiles?:Pick<Profile,'first_name'|'last_name'> }
