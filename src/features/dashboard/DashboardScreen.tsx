import{Ionicons}from'@expo/vector-icons';
import{useQuery}from'@tanstack/react-query';
import{useRouter}from'expo-router';
import{StyleSheet,Text,View}from'react-native';
import{Button}from'@/components/Button';
import{Card}from'@/components/Card';
import{EmptyState}from'@/components/EmptyState';
import{ScreenContainer}from'@/components/ScreenContainer';
import{useAuth}from'@/hooks/useAuth';
import{useCurrentGroup}from'@/hooks/useCurrentGroup';
import{colors}from'@/lib/theme';
import{countStudents}from'@/services/groups.service';
import{getSchedule}from'@/services/schedule.service';
import{formatDate,formatTime}from'@/utils/date';

export function DashboardScreen(){
  const{profile}=useAuth();
  const router=useRouter();
  const groups=useCurrentGroup();
  const ids=groups.data?.map(group=>group.id)??[];
  const schedule=useQuery({queryKey:['schedule',ids],queryFn:()=>getSchedule(ids),enabled:ids.length>0});
  const students=useQuery({queryKey:['student-count',ids],queryFn:()=>countStudents(ids),enabled:profile?.role==='teacher'&&ids.length>0});
  const upcoming=schedule.data?.filter(item=>new Date(item.starts_at)>new Date()&&item.status!=='cancelled')??[];
  const next=upcoming[0];
  return <ScreenContainer><View style={styles.header}><View><Text style={styles.kicker}>{profile?.role==='teacher'?'TEACHER SPACE':'STUDENT SPACE'}</Text><Text style={styles.title}>Hi, {profile?.first_name} 👋</Text><Text style={styles.muted}>Ready to build something great?</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</Text></View></View><View style={styles.stats}><View style={[styles.stat,styles.purple]}><Ionicons name="people-outline" size={22} color={colors.primary}/><Text style={styles.statNumber}>{ids.length}</Text><Text style={styles.statLabel}>Groups</Text></View><View style={[styles.stat,styles.mint]}><Ionicons name={profile?.role==='teacher'?'person-outline':'calendar-outline'} size={22} color={colors.mint}/><Text style={styles.statNumber}>{profile?.role==='teacher'?students.data??0:upcoming.length}</Text><Text style={styles.statLabel}>{profile?.role==='teacher'?'Students':'Upcoming'}</Text></View></View>{next?<Card tone="coral"><View style={styles.cardHeading}><View style={styles.roundIcon}><Ionicons name="rocket-outline" size={21} color={colors.coral}/></View><Text style={styles.label}>NEXT LESSON</Text></View><Text style={styles.cardTitle}>{next.groups?.name??next.title}</Text><Text style={styles.time}>{formatDate(next.starts_at)} · {formatTime(next.starts_at)}</Text><Text style={styles.muted}>{next.title}</Text></Card>:<EmptyState title="No upcoming lessons" message="Your next scheduled lesson will appear here."/>}<Card tone="purple"><View style={styles.cardHeading}><Ionicons name="layers-outline" size={22} color={colors.primary}/><Text style={styles.cardTitle}>Your groups</Text></View>{groups.data?.map(group=><View key={group.id} style={styles.groupRow}><View style={styles.groupDot}/><View style={styles.groupBody}><Text style={styles.group}>{group.name}</Text>{group.description?<Text style={styles.muted}>{group.description}</Text>:null}</View></View>)}{!groups.data?.length?<Text style={styles.muted}>No groups assigned yet.</Text>:null}</Card><View style={styles.actions}><View style={styles.action}><Button title="View schedule" onPress={()=>router.push(profile?.role==='teacher'?"/(teacher)/schedule":"/(student)/schedule")}/></View><View style={styles.action}><Button title="Open chat" variant="secondary" onPress={()=>router.push(profile?.role==='teacher'?"/(teacher)/chat":"/(student)/chat")}/></View></View></ScreenContainer>
}

const styles=StyleSheet.create({header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},kicker:{fontSize:11,letterSpacing:2,color:colors.primary,fontWeight:'900'},title:{fontSize:30,fontWeight:'900',color:colors.ink,marginTop:5},muted:{color:colors.muted,lineHeight:20},avatar:{width:52,height:52,borderRadius:18,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontSize:17,fontWeight:'900'},stats:{flexDirection:'row',gap:12},stat:{flex:1,borderRadius:20,padding:16,gap:4},purple:{backgroundColor:colors.primarySoft},mint:{backgroundColor:colors.mintSoft},statNumber:{fontSize:25,fontWeight:'900',color:colors.ink},statLabel:{color:colors.muted,fontSize:13,fontWeight:'700'},cardHeading:{flexDirection:'row',alignItems:'center',gap:10},roundIcon:{width:38,height:38,borderRadius:19,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},label:{fontSize:11,fontWeight:'900',letterSpacing:1.5,color:colors.coral},cardTitle:{fontSize:20,fontWeight:'800',color:colors.ink},time:{fontSize:16,fontWeight:'700',color:colors.ink},groupRow:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:5},groupDot:{width:10,height:10,borderRadius:5,backgroundColor:colors.mint},groupBody:{flex:1},group:{fontSize:16,fontWeight:'700',color:colors.ink},actions:{flexDirection:'row',gap:12},action:{flex:1}});
