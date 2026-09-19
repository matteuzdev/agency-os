import {AGENTS} from "./config.js";

export const $=s=>document.querySelector(s);
export let provider=localStorage.getItem("agency-provider")||"openrouter";
export let model=localStorage.getItem("agency-model")||(provider==="openrouter"?"openrouter/auto":"openai/gpt-5.4");
export let rememberKey=localStorage.getItem("agency-remember-key")==="1";
export let tempKey=(rememberKey?localStorage.getItem("agency-ai-key"):"")||sessionStorage.getItem("agency-ai-key")||"";
export let selectedAgent=AGENTS.find(a=>a.name==="Orion");
export let aiBusy=false;

export const store=JSON.parse(localStorage.getItem("agency-game-state")||'{"messages":{},"logs":[]}');

export function setProvider(v){provider=v;}
export function setModel(v){model=v;}
export function setTempKey(v,remember=rememberKey){
  tempKey=v;rememberKey=remember;
  if(v)sessionStorage.setItem("agency-ai-key",v); else sessionStorage.removeItem("agency-ai-key");
  localStorage.setItem("agency-remember-key",remember?"1":"0");
  if(remember&&v)localStorage.setItem("agency-ai-key",v); else localStorage.removeItem("agency-ai-key");
}
export function setSelectedAgent(v){selectedAgent=v;}
export function setAiBusy(v){aiBusy=v;}
export function saveStore(){localStorage.setItem("agency-game-state",JSON.stringify(store));}

export function esc(s=""){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

export function conversation(agent){
  return store.messages[agent.name]||(store.messages[agent.name]=[{
    type:"agent",agent:agent.name,text:"Oi, Hianto. Sou "+agent.name+", "+agent.role+". Este é meu espaço dentro do Agency OS."
  }]);
}

export function addLog(agent,action,detail=""){
  store.logs.unshift({time:new Date().toLocaleTimeString("pt-BR"),agent,action,detail});
  store.logs=store.logs.slice(0,200);
  saveStore();
  renderLogs();
}

export function renderLogs(){
  const rows=store.logs.length?store.logs:[{time:"--:--",agent:"SYSTEM",action:"READY",detail:"Nenhum evento ainda."}];
  $("#logs").innerHTML=rows.map(l=>'<div class="row"><span>'+esc(l.time)+'</span> · <b>'+esc(l.agent)+'</b> · '+esc(l.action)+'<br>'+esc(l.detail)+'</div>').join("");
}

export function renderMessages(){
  const list=conversation(selectedAgent);
  $("#messages").innerHTML=list.map(m=>'<div class="msg '+(m.type||"agent")+'">'+esc(m.text)+'</div>').join("")+
    (aiBusy?'<div class="msg agent"><span class="typing"><i></i><i></i><i></i> '+esc(selectedAgent.name)+' está pensando</span></div>':"");
  $("#panel").scrollTop=$("#panel").scrollHeight;
}

export function clearStoredKey(){
  tempKey="";rememberKey=false;
  sessionStorage.removeItem("agency-ai-key");
  localStorage.removeItem("agency-ai-key");
  localStorage.setItem("agency-remember-key","0");
}

export function persistAi(){
  localStorage.setItem("agency-provider",provider);
  localStorage.setItem("agency-model",model);
}
