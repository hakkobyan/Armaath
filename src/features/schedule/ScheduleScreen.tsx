import{zodResolver}from'@hookform/resolvers/zod';
import{useMutation,useQuery,useQueryClient}from'@tanstack/react-query';
import React from'react';
import{Controller,useForm}from'react-hook-form';
import{Modal,Pressable,StyleSheet,Text,View}from'react-native';
import{z}from'zod';
import{Button}from'@/components/Button';
import{Card}from'@/components/Card';
import{DateTimeField}from'@/components/DateTimeField';
import{EmptyState}from'@/components/EmptyState';
import{Input}from'@/components/Input';
import{ScreenContainer}from'@/components/ScreenContainer';
import{useAuth}from'@/hooks/useAuth';
import{useCurrentGroup}from'@/hooks/useCurrentGroup';
import{getSchedule,removeSchedule,saveSchedule}from'@/services/schedule.service';
import type{ScheduleItem,ScheduleStatus}from'@/types/models';
import{formatDate,formatTime}from'@/utils/date';
import{scheduleSchema}from'@/utils/validation';

type Form=z.infer<typeof scheduleSchema>;
function newLessonDefaults():Form{const start=new Date();start.setSeconds(0,0);start.setMinutes(0);start.setHours(start.getHours()+1);const end=new Date(start.getTime()+90*60*1000);return{group_id:'',title:'',description:'',starts_at:start.toISOString(),ends_at:end.toISOString(),status:'scheduled'}}

export function ScheduleScreen(){
  const{profile}=useAuth();
  const groups=useCurrentGroup();
  const ids=groups.data?.map(group=>group.id)??[];
  const query=useQuery({queryKey:['schedule',ids],queryFn:()=>getSchedule(ids),enabled:ids.length>0});
  const queryClient=useQueryClient();
  const form=useForm<Form>({resolver:zodResolver(scheduleSchema),defaultValues:newLessonDefaults()});
  const[visible,setVisible]=React.useState(false);
  const[editing,setEditing]=React.useState<string>();
  const open=(item?:ScheduleItem)=>{form.reset(item?{group_id:item.group_id,title:item.title,description:item.description??'',starts_at:item.starts_at,ends_at:item.ends_at,status:item.status}:{...newLessonDefaults(),group_id:groups.data?.[0]?.id??''});setEditing(item?.id);setVisible(true)};
  const mutation=useMutation({mutationFn:(values:Form)=>saveSchedule({...values,room:null,id:editing,teacher_id:profile!.id}),onSuccess:async()=>{setVisible(false);await queryClient.invalidateQueries({queryKey:['schedule']})}});
  const remove=useMutation({mutationFn:removeSchedule,onSuccess:()=>queryClient.invalidateQueries({queryKey:['schedule']})});

  return <ScreenContainer><View style={styles.header}><Text style={styles.title}>Schedule</Text>{profile?.role==='teacher'?<Button title="Add lesson" onPress={()=>open()}/>:null}</View>{query.isError?<Text style={styles.error}>Schedule could not be loaded. Check your connection.</Text>:null}{!query.isLoading&&!query.data?.length?<EmptyState title="No lessons" message="There are no schedule items for your groups."/>:query.data?.map((item,index)=><View key={item.id} style={styles.day}>{index===0||formatDate(query.data[index-1].starts_at)!==formatDate(item.starts_at)?<Text style={styles.date}>{formatDate(item.starts_at)}</Text>:null}<Card><Text style={[styles.lesson,item.status==='cancelled'&&styles.cancelled]}>{item.title}</Text><Text>{item.groups?.name} · {formatTime(item.starts_at)}–{formatTime(item.ends_at)}</Text><Text style={styles.muted}>{item.status}</Text>{item.profiles?<Text style={styles.muted}>{item.profiles.first_name} {item.profiles.last_name}</Text>:null}{item.description?<Text>{item.description}</Text>:null}{profile?.role==='teacher'?<View style={styles.actions}><Pressable onPress={()=>open(item)}><Text style={styles.link}>Edit</Text></Pressable>{item.status!=='cancelled'?<Pressable onPress={()=>mutation.mutate({...item,description:item.description??'',status:'cancelled'})}><Text style={styles.link}>Cancel</Text></Pressable>:null}<Pressable onPress={()=>remove.mutate(item.id)}><Text style={styles.danger}>Delete</Text></Pressable></View>:null}</Card></View>)}<Modal visible={visible} animationType="slide" onRequestClose={()=>setVisible(false)}><ScreenContainer><Text style={styles.title}>{editing?'Edit lesson':'New lesson'}</Text><Text style={styles.label}>Group</Text><View style={styles.choices}>{groups.data?.map(group=><Pressable key={group.id} onPress={()=>form.setValue('group_id',group.id,{shouldValidate:true})} style={[styles.choice,form.watch('group_id')===group.id&&styles.selected]}><Text>{group.name}</Text></Pressable>)}</View>{form.formState.errors.group_id?<Text style={styles.error}>{form.formState.errors.group_id.message}</Text>:null}{(['title','description']as const).map(name=><Controller key={name} control={form.control} name={name} render={({field:{value,onChange,onBlur}})=><Input label={name} value={value} onChangeText={onChange} onBlur={onBlur} error={form.formState.errors[name]?.message}/>}/>) }<Controller control={form.control} name="starts_at" render={({field:{value,onChange}})=><DateTimeField label="Starts at" value={value} onChange={onChange} error={form.formState.errors.starts_at?.message}/>}/><Controller control={form.control} name="ends_at" render={({field:{value,onChange}})=><DateTimeField label="Ends at" value={value} onChange={onChange} error={form.formState.errors.ends_at?.message}/>}/><Text style={styles.label}>Status</Text><View style={styles.choices}>{(['scheduled','changed','cancelled','completed']as ScheduleStatus[]).map(status=><Pressable key={status} style={[styles.choice,form.watch('status')===status&&styles.selected]} onPress={()=>form.setValue('status',status)}><Text>{status}</Text></Pressable>)}</View>{mutation.error?<Text style={styles.error}>Could not save this lesson.</Text>:null}<Button title="Save lesson" loading={mutation.isPending} disabled={mutation.isPending} onPress={form.handleSubmit(values=>mutation.mutate(values))}/><Button title="Close" variant="secondary" onPress={()=>setVisible(false)}/></ScreenContainer></Modal></ScreenContainer>
}

const styles=StyleSheet.create({header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},title:{fontSize:30,fontWeight:'800'},day:{gap:8},date:{fontSize:17,fontWeight:'700'},lesson:{fontSize:18,fontWeight:'700'},cancelled:{textDecorationLine:'line-through',color:'#a33'},muted:{color:'#686879'},actions:{flexDirection:'row',gap:20,marginTop:8},link:{color:'#5142da',fontWeight:'700'},danger:{color:'#b42336',fontWeight:'700'},error:{color:'#b42336'},label:{fontWeight:'700',textTransform:'capitalize'},choices:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{borderWidth:1,borderColor:'#d8d7e1',padding:10,borderRadius:10},selected:{backgroundColor:'#dcd8ff',borderColor:'#5b4cf0'}});
