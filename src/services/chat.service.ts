import*as DocumentPicker from'expo-document-picker';
import{File as ExpoFile}from'expo-file-system';
import{Platform}from'react-native';
import{supabase}from'@/lib/supabase';
import type{ChatRoom,Message}from'@/types/models';

export type PendingAttachment={uri:string;name:string;mimeType:string;size:number;webFile?:File};

export async function getChatRoom(groupId:string){const{data,error}=await supabase.from('chat_rooms').select('*').eq('group_id',groupId).maybeSingle();if(error)throw error;return data as ChatRoom|null}
export async function getGlobalChatRoom(){const{data,error}=await supabase.from('chat_rooms').select('*').eq('room_type','global').maybeSingle();if(error)throw error;return data as ChatRoom|null}

async function attachSignedUrls(messages:Message[]){return Promise.all(messages.map(async message=>{if(!message.attachment_path||message.is_deleted)return{...message,attachment_url:null};const{data}=await supabase.storage.from('chat-attachments').createSignedUrl(message.attachment_path,3600);return{...message,attachment_url:data?.signedUrl??null}}))}
export async function getMessages(roomId:string){const{data,error}=await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(first_name,last_name)').eq('chat_room_id',roomId).order('created_at').limit(200);if(error)throw error;return attachSignedUrls(data as Message[])}

export async function pickAttachment(kind:'image'|'file'){const result=await DocumentPicker.getDocumentAsync({type:kind==='image'?'image/*':'*/*',multiple:false,copyToCacheDirectory:true});if(result.canceled)return null;const asset=result.assets[0];if((asset.size??0)>10*1024*1024)throw new Error('Files must be 10 MB or smaller.');return{uri:asset.uri,name:asset.name,mimeType:asset.mimeType??'application/octet-stream',size:asset.size??0,webFile:asset.file}as PendingAttachment}

async function uploadAttachment(roomId:string,senderId:string,attachment:PendingAttachment){const safeName=attachment.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120);const path=`${roomId}/${senderId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;const body=Platform.OS==='web'&&attachment.webFile?await attachment.webFile.arrayBuffer():await new ExpoFile(attachment.uri).arrayBuffer();const{error}=await supabase.storage.from('chat-attachments').upload(path,body,{contentType:attachment.mimeType,upsert:false});if(error)throw error;return path}

export async function sendMessage(roomId:string,senderId:string,content:string,attachment?:PendingAttachment|null){let attachmentPath:string|null=null;try{if(attachment)attachmentPath=await uploadAttachment(roomId,senderId,attachment);const{data,error}=await supabase.from('messages').insert({chat_room_id:roomId,sender_id:senderId,content:content.trim(),attachment_path:attachmentPath,attachment_name:attachment?.name??null,attachment_type:attachment?.mimeType??null,attachment_size:attachment?.size??null}).select().single();if(error)throw error;return data}catch(error){if(attachmentPath)await supabase.storage.from('chat-attachments').remove([attachmentPath]);throw error}}
export async function deleteMessage(id:string){const{data,error:readError}=await supabase.from('messages').select('attachment_path').eq('id',id).single();if(readError)throw readError;const{error}=await supabase.from('messages').update({is_deleted:true,content:'Message deleted'}).eq('id',id);if(error)throw error;if(data.attachment_path)await supabase.storage.from('chat-attachments').remove([data.attachment_path])}
