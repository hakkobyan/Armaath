import DateTimePicker,{type DateTimePickerEvent}from'@react-native-community/datetimepicker';
import React,{useState}from'react';
import{Platform,Pressable,StyleSheet,Text,View}from'react-native';
import{formatDate,formatTime}from'@/utils/date';

type PickerMode='date'|'time';

function parseValue(value:string){const parsed=new Date(value);return Number.isNaN(parsed.getTime())?new Date():parsed}
function pad(value:number){return String(value).padStart(2,'0')}
function toLocalInput(value:string){const date=parseValue(value);return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`}

export function DateTimeField({label,value,onChange,error}:{label:string;value:string;onChange:(value:string)=>void;error?:string}){
  const[mode,setMode]=useState<PickerMode|null>(null);
  const date=parseValue(value);
  const handleNativeChange=(event:DateTimePickerEvent,next?:Date)=>{if(Platform.OS==='android')setMode(null);if(event.type==='set'&&next)onChange(next.toISOString())};

  if(Platform.OS==='web')return <View style={styles.wrap}><Text style={styles.label}>{label}</Text>{React.createElement('input',{type:'datetime-local',value:toLocalInput(value),onChange:(event:React.ChangeEvent<HTMLInputElement>)=>onChange(new Date(event.target.value).toISOString()),style:webInputStyle})}{error?<Text style={styles.error}>{error}</Text>:null}</View>;

  return <View style={styles.wrap}><Text style={styles.label}>{label}</Text><View style={styles.row}><Pressable accessibilityRole="button" style={styles.control} onPress={()=>setMode('date')}><Text style={styles.controlHint}>DATE</Text><Text style={styles.controlValue}>{formatDate(date.toISOString())}</Text></Pressable><Pressable accessibilityRole="button" style={styles.control} onPress={()=>setMode('time')}><Text style={styles.controlHint}>TIME</Text><Text style={styles.controlValue}>{formatTime(date.toISOString())}</Text></Pressable></View>{mode?<View style={styles.picker}><DateTimePicker value={date} mode={mode} display={Platform.OS==='ios'?'spinner':'default'} minuteInterval={5} themeVariant={Platform.OS==='ios'?'light':undefined} textColor={Platform.OS==='ios'?'#172033':undefined} accentColor="#6757E8" onChange={handleNativeChange}/>{Platform.OS==='ios'?<Pressable style={styles.done} onPress={()=>setMode(null)}><Text style={styles.doneText}>Done</Text></Pressable>:null}</View>:null}{error?<Text style={styles.error}>{error}</Text>:null}</View>
}

const webInputStyle:React.CSSProperties={width:'100%',minHeight:48,border:'1px solid #d8d7e1',borderRadius:12,padding:'0 14px',fontSize:16,color:'#171721',backgroundColor:'#fff',boxSizing:'border-box'};
const styles=StyleSheet.create({wrap:{gap:7},label:{fontSize:14,fontWeight:'700',color:'#262638'},row:{flexDirection:'row',gap:10},control:{flex:1,minHeight:58,borderWidth:1,borderColor:'#d8d7e1',borderRadius:12,paddingHorizontal:14,justifyContent:'center',backgroundColor:'#fff'},controlHint:{fontSize:10,fontWeight:'800',letterSpacing:1,color:'#7164e8'},controlValue:{fontSize:16,fontWeight:'600',color:'#171721'},picker:{borderRadius:12,overflow:'hidden',backgroundColor:'#fff'},done:{alignSelf:'flex-end',padding:12},doneText:{color:'#5142da',fontWeight:'800'},error:{color:'#b42336',fontSize:13}});
