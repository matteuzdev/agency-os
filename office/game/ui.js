import {AGENTS} from "./config.js";
import {$,provider,model,tempKey,rememberKey,selectedAgent,aiBusy,setProvider,setModel,setTempKey,clearStoredKey,setSelectedAgent,setAiBusy,conversation,store,saveStore,addLog,renderLogs,renderMessages,persistAi} from "./state.js";

let meetingActive=false;
let mediaRecorder=null;
let recordingChunks=[];

export function showPane(name){
  document.querySelectorAll(".pane").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll("[data-pane]").forEach(b=>b.classList.remove("primary"));
  $("#"+name+"Pane")?.classList.add("active");
  document.querySelector('[data-pane="'+name+'"]')?.classList.add("primary");
}

function setHeader(name,role,task,status="working"){
  $("#portrait").textContent=name.slice(0,2).toUpperCase();
  $("#agentName").textContent=name;
  $("#agentRole").textContent=role;
  $("#agentTask").textContent=task;
  const state=$("#agentStatus");
  state.textContent=status.toUpperCase();
  state.className="state "+status;
}

export function updateAgentPanel(agent){
  meetingActive=false;
  setSelectedAgent(agent);
  $("#agentPanel").classList.add("open");
  setHeader(agent.name,agent.role,agent.task,agent.status);
  renderMessages();
  window.__agencyOfficeScene?.setSelectedAgent(agent);
}

function refreshAiLabels(){
  const label=provider==="openrouter"?"OpenRouter":"Vercel AI Gateway";
  $("#hudProvider").textContent=label;
  $("#hudModel").textContent=model;
  $("#chatProvider").textContent=label+" · "+model;
}

async function loadModels(nextProvider=provider){
  const status=$("#modelStatus");
  status.textContent="Carregando catálogo de modelos...";
  status.className="field-note model-loading";
  $("#modelOptions").innerHTML="";
  try{
    const response=await fetch("/api/models?provider="+encodeURIComponent(nextProvider));
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Falha ao carregar modelos");
    const models=Array.isArray(data.models)?data.models:[];
    const fragment=document.createDocumentFragment();
    for(const item of models.slice(0,900)){
      const option=document.createElement("option");
      option.value=item.id;option.label=item.name||item.id;fragment.appendChild(option);
    }
    $("#modelOptions").appendChild(fragment);
    status.textContent=nextProvider==="openrouter"
      ?models.length+" modelos carregados do OpenRouter."
      :models.length+" sugestões carregadas.";
    status.className="field-note";
  }catch(error){
    status.textContent="Catálogo indisponível: "+error.message+". Digite o slug manualmente.";
    status.className="field-note offline";
  }
}

function updateSettingsUi(){
  $("#provider").value=provider;
  $("#model").value=model;
  $("#apiKey").value=tempKey;
  $("#rememberKey").checked=rememberKey;
  $("#keyLabel").textContent=provider==="openrouter"
    ?"OpenRouter API Key temporária (opcional)"
    :"Vercel AI Gateway Key temporária (opcional)";
  refreshAiLabels();
}

function apiHeaders(){
  const headers={"Content-Type":"application/json"};
  if(tempKey)headers["x-agency-ai-key"]=tempKey;
  return headers;
}

function markActivity(agent,text,proof="internal"){
  $("#activityAgent").textContent=agent;
  $("#activityText").textContent=text;
  const badge=$("#activityProof");
  badge.textContent=proof==="real"?"COM EVIDÊNCIA":proof==="approval"?"APROVAÇÃO":"INTERNO";
  badge.className="activity-proof "+proof;
}

function parseMentions(text){
  const found=[];
  const regex=/@([A-Za-zÀ-ÿ0-9_-]+)/g;
  let match;
  while((match=regex.exec(text))){
    const agent=AGENTS.find(a=>a.name.toLowerCase()===match[1].toLowerCase());
    if(agent&&!found.includes(agent.name))found.push(agent.name);
  }
  return found;
}

function renderMeeting(){
  const meeting=store.meeting||{participants:[],transcript:[],topic:"Reunião"};
  $("#meetingParticipants").innerHTML=(meeting.participants||[]).map(n=>"<span>@"+n+"</span>").join("");
  $("#meetingTranscript").innerHTML=(meeting.transcript||[]).map(m=>{
    const cls=m.role==="user"?"user":m.role==="system"?"system":"agent";
    const who=m.agent?("<b>"+m.agent+"</b><br>"):"";
    return '<div class="msg '+cls+'">'+who+String(m.text||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))+"</div>";
  }).join("");
  $("#panel").scrollTop=$("#panel").scrollHeight;
}

function startMeeting(names,topic="Reunião convocada por Hianto"){
  if(!names.length)return;
  meetingActive=true;
  store.meeting={participants:names,topic,transcript:[],startedAt:new Date().toISOString()};
  saveStore();
  setHeader("Reunião",names.map(n=>"@"+n).join(" · "),topic,"working");
  $("#agentPanel").classList.add("open");
  showPane("meeting");
  renderMeeting();
  window.__agencyOfficeScene?.summonToMeeting(names);
  addLog("Orion","MEETING_STARTED",names.join(", ")+" · "+topic);
  markActivity("Orion","convocando "+names.join(", ")+" para a sala de reunião","internal");
}

async function sendMeetingMessage(text){
  const meeting=store.meeting;
  if(!meeting?.participants?.length)return;
  meeting.transcript.push({role:"user",agent:"Hianto",text});
  renderMeeting();saveStore();
  setAiBusy(true);$("#send").disabled=true;$("#send").textContent="Reunião...";
  try{
    const participants=meeting.participants.map(name=>{
      const a=AGENTS.find(x=>x.name===name);
      return {name:a.name,role:a.role,task:a.task};
    });
    const response=await fetch("/api/meeting",{
      method:"POST",headers:apiHeaders(),
      body:JSON.stringify({provider,model,participants,topic:meeting.topic,history:meeting.transcript.slice(-20),message:text})
    });
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Falha na reunião");
    for(const turn of (data.turns||[])){
      meeting.transcript.push({role:"agent",agent:turn.agent,text:turn.text});
      const a=AGENTS.find(x=>x.name===turn.agent);
      if(a)window.__agencyOfficeScene?.showSpeech(a,turn.text);
    }
    if(data.summary)meeting.transcript.push({role:"system",agent:"Orion",text:"Resumo: "+data.summary});
    for(const action of (data.actions||[])){
      const proof=action.risk&&["WRITE","PUBLISH","SPEND","DELETE"].includes(action.risk)?"approval":"internal";
      markActivity(action.agent||"Agent",action.action||action.kind,proof);
      addLog(action.agent||"SYSTEM","ACTION_PROPOSED",(action.kind||"internal")+" · "+(action.action||"")+" · "+(action.risk||"READ"));
    }
    saveStore();renderMeeting();
  }catch(error){
    meeting.transcript.push({role:"system",agent:"SYSTEM",text:"Erro na reunião: "+error.message});
    saveStore();renderMeeting();
  }finally{
    setAiBusy(false);$("#send").disabled=false;$("#send").textContent="Enviar";
  }
}

async function sendIndividualMessage(text){
  const agent=selectedAgent;
  conversation(agent).push({type:"user",text,at:new Date().toISOString()});
  saveStore();addLog(agent.name,"USER_MESSAGE",text.slice(0,120));
  setAiBusy(true);$("#send").disabled=true;$("#send").textContent="Pensando...";renderMessages();
  try{
    const response=await fetch("/api/chat",{
      method:"POST",headers:apiHeaders(),
      body:JSON.stringify({provider,model,agent:agent.name,role:agent.role,task:agent.task,clientId:"demo-rafaelly-001",message:text,history:conversation(agent).slice(-12)})
    });
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Falha ao conversar com a IA");
    conversation(agent).push({type:"agent",agent:agent.name,text:data.reply||"(sem resposta)",response_id:data.response_id});
    if(data.task_update){agent.task=data.task_update;if(selectedAgent===agent)$("#agentTask").textContent=agent.task;}
    addLog(agent.name,"AI_RESPONSE",(data.provider||provider)+" · "+(data.model||model));
    markActivity(agent.name,"respondendo e atualizando a tarefa","internal");
    window.__agencyOfficeScene?.showSpeech(agent,data.reply||"");
    if(data.handoff?.to){
      const target=AGENTS.find(a=>a.name.toLowerCase()===String(data.handoff.to).toLowerCase())||AGENTS.find(a=>a.name==="Orion");
      const reason=data.handoff.reason||"delegação",message=data.handoff.message||reason;
      conversation(agent).push({type:"handoff",text:"→ HANDOFF PARA "+target.name+": "+reason});
      conversation(target).push({type:"handoff",agent:agent.name,text:"Handoff de "+agent.name+": "+message});
      conversation(AGENTS.find(a=>a.name==="Orion")).push({type:"system",text:"Handoff registrado: "+agent.name+" → "+target.name+". Motivo: "+reason});
      addLog(agent.name,"HANDOFF","→ "+target.name+": "+reason);
      window.__agencyOfficeScene?.showHandoff(agent,target,reason);
    }
    if(Array.isArray(data.actions)){
      for(const action of data.actions){
        const proof=action.status==="done"&&action.evidence?"real":action.approval_required?"approval":"internal";
        markActivity(agent.name,action.action||action.capability||"ação",proof);
        addLog(agent.name,"TOOL_REQUEST",(action.capability||action.kind||"tool")+" · "+(action.status||"proposed"));
      }
    }
    saveStore();
  }catch(error){
    conversation(agent).push({type:"system",text:"Erro de IA: "+error.message+". Confira gateway, modelo e credencial."});
    addLog("SYSTEM","AI_ERROR",error.message);saveStore();
  }finally{
    setAiBusy(false);$("#send").disabled=false;$("#send").textContent="Enviar";
    if(selectedAgent===agent&&!meetingActive)renderMessages();
  }
}

async function sendMessage(){
  if(aiBusy)return;
  const input=$("#message"),text=input.value.trim();
  if(!text)return;
  input.value="";
  if(meetingActive&&$("#meetingPane").classList.contains("active"))await sendMeetingMessage(text);
  else await sendIndividualMessage(text);
}

function bindSettings(){
  $("#settingsBtn").addEventListener("click",async()=>{
    updateSettingsUi();$("#settings").classList.add("open");await loadModels(provider);
  });
  $("#closeSettings").addEventListener("click",()=>$("#settings").classList.remove("open"));
  $("#provider").addEventListener("change",async event=>{
    const next=event.target.value;
    $("#keyLabel").textContent=next==="openrouter"?"OpenRouter API Key temporária (opcional)":"Vercel AI Gateway Key temporária (opcional)";
    const current=$("#model").value.trim();
    if(next==="openrouter"&&(!current||current.startsWith("openai/gpt-5.4")))$("#model").value="openrouter/auto";
    if(next==="vercel"&&(!current||current==="openrouter/auto"))$("#model").value="openai/gpt-5.4";
    await loadModels(next);
  });
  $("#saveSettings").addEventListener("click",()=>{
    const nextProvider=$("#provider").value;
    const nextModel=$("#model").value.trim()||(nextProvider==="openrouter"?"openrouter/auto":"openai/gpt-5.4");
    setProvider(nextProvider);setModel(nextModel);setTempKey($("#apiKey").value.trim(),$("#rememberKey").checked);persistAi();
    $("#settings").classList.remove("open");refreshAiLabels();
    addLog("SYSTEM","AI_CONFIG",nextProvider+" · "+nextModel+" · "+($("#apiKey").value.trim()?($("#rememberKey").checked?"chave salva neste dispositivo":"chave desta aba"):"env da Vercel"));
  });
  $("#clearKey").addEventListener("click",()=>{
    clearStoredKey();$("#apiKey").value="";$("#rememberKey").checked=false;
    addLog("SYSTEM","TEMP_KEY_CLEARED","Chave removida do navegador.");
  });
}

function bindMentions(){
  const list=$("#agentMentions"),frag=document.createDocumentFragment();
  for(const agent of AGENTS){
    const opt=document.createElement("option");opt.value="@"+agent.name;opt.label=agent.role;frag.appendChild(opt);
  }
  list.appendChild(frag);

  const execute=()=>{
    const text=$("#globalCommand").value.trim();
    const names=parseMentions(text);
    if(!names.length){$("#globalCommand").placeholder="Use @nome, ex.: @Maya @Mia reunião";return;}
    const isMeeting=/reuni[aã]o|meeting|todos|equipe/i.test(text)||names.length>1;
    if(isMeeting)startMeeting(names,text.replace(/@\S+/g,"").trim()||"Reunião convocada por Hianto");
    else{
      window.__agencyOfficeScene?.summonToOwner(names);
      const agent=AGENTS.find(a=>a.name===names[0]);
      if(agent){updateAgentPanel(agent);showPane("chat");}
      markActivity(names[0],"a caminho da Sala do Hianto","internal");
    }
    $("#globalCommand").value="";
  };
  $("#callMentioned").addEventListener("click",execute);
  $("#globalCommand").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();execute();}});
}

async function toggleRecording(){
  const btn=$("#recordRoom"),canvas=document.querySelector("#gameStage canvas");
  if(!canvas?.captureStream||typeof MediaRecorder==="undefined"){
    alert("Este navegador não suporta gravação direta do canvas.");
    return;
  }
  if(mediaRecorder&&mediaRecorder.state==="recording"){
    mediaRecorder.stop();btn.classList.remove("recording");btn.textContent="🎥 Filmar sala";return;
  }
  window.__agencyOfficeScene?.focusRoom("owner");
  $("#agentPanel").classList.remove("open");
  recordingChunks=[];
  mediaRecorder=new MediaRecorder(canvas.captureStream(30),{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});
  mediaRecorder.ondataavailable=e=>{if(e.data.size)recordingChunks.push(e.data);};
  mediaRecorder.onstop=()=>{
    const blob=new Blob(recordingChunks,{type:"video/webm"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="agency-os-sala-hianto-"+new Date().toISOString().replace(/[:.]/g,"-")+".webm";
    a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  mediaRecorder.start();
  btn.classList.add("recording");btn.textContent="⏹ Parar gravação";
  addLog("SYSTEM","ROOM_RECORDING","Gravação local da Sala do Hianto iniciada.");
}

export function bindUI(){
  $("#closePanel").addEventListener("click",()=>$("#agentPanel").classList.remove("open"));
  $("#openLogs").addEventListener("click",()=>{$("#agentPanel").classList.add("open");showPane("logs");});
  $("#openOrion").addEventListener("click",()=>{
    const orion=AGENTS.find(a=>a.name==="Orion");updateAgentPanel(orion);showPane("chat");
  });
  $("#goMyRoom").addEventListener("click",()=>window.__agencyOfficeScene?.focusRoom("owner"));
  $("#goMeeting").addEventListener("click",()=>window.__agencyOfficeScene?.focusRoom("meeting"));
  $("#recordRoom").addEventListener("click",toggleRecording);

  document.querySelectorAll("[data-pane]").forEach(b=>b.addEventListener("click",()=>showPane(b.dataset.pane)));
  bindSettings();bindMentions();

  $("#send").addEventListener("click",sendMessage);
  $("#message").addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();sendMessage();}});
  $("#endMeeting").addEventListener("click",()=>{
    if(store.meeting?.participants)window.__agencyOfficeScene?.endMeeting();
    meetingActive=false;addLog("Orion","MEETING_ENDED",store.meeting?.topic||"Reunião");
    updateAgentPanel(AGENTS.find(a=>a.name==="Orion"));showPane("chat");
  });

  $("#copyHandoff").addEventListener("click",async()=>{
    const packet={schema:"agency-os/handoff-v0.4",client_id:"demo-rafaelly-001",source:"living-office",from:"Hianto",to:selectedAgent.name,agent_role:selectedAgent.role,current_task:selectedAgent.task,provider,model,conversation:conversation(selectedAgent).slice(-12),return_to:"Orion"};
    const text=JSON.stringify(packet,null,2);
    try{await navigator.clipboard.writeText(text);addLog(selectedAgent.name,"HANDOFF_COPIED","Pacote copiado.");alert("Handoff copiado.");}
    catch{prompt("Copie o handoff:",text);}
  });

  $("#talkMobile").addEventListener("click",()=>{const near=window.__agencyOfficeScene?.nearestAgent();if(near)window.__agencyOfficeScene.openAgent(near);});
  [["up",-1,-1],["down",1,1],["left",-1,1],["right",1,-1]].forEach(([id,dx,dy])=>{$("#"+id).addEventListener("click",()=>window.__agencyOfficeScene?.step(dx,dy));});

  window.addEventListener("agency:open-agent",event=>{
    updateAgentPanel(event.detail);showPane("chat");$("#message").focus();
    addLog(event.detail.name,"OPEN_CONVERSATION","Hianto chegou até o agente.");
  });
  window.addEventListener("agency:log",event=>addLog(event.detail.agent,event.detail.action,event.detail.detail));
  window.addEventListener("agency:agent-action",event=>{
    const d=event.detail;markActivity(d.agent,d.action,d.kind==="external"?"real":"internal");
    addLog(d.agent,"VISIBLE_ACTIVITY",d.action+" · "+d.task);
  });
  window.addEventListener("agency:external-action",event=>{
    const d=event.detail;markActivity(d.agent,d.action,d.status==="done"&&d.evidence?"real":"approval");
    addLog(d.agent,"EXTERNAL_ACTION",(d.capability||"tool")+" · "+d.status);
  });

  updateAgentPanel(selectedAgent);$("#agentPanel").classList.remove("open");
  renderLogs();refreshAiLabels();markActivity("SYSTEM","Living Office online","internal");
  addLog("SYSTEM","OFFICE_READY","Gateway atual: "+provider+" · "+model);
}
