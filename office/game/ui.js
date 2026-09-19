import {AGENTS} from "./config.js";
import {$,provider,model,tempKey,rememberKey,selectedAgent,aiBusy,setProvider,setModel,setTempKey,clearStoredKey,setSelectedAgent,setAiBusy,conversation,store,saveStore,addLog,renderLogs,renderMessages,persistAi} from "./state.js";

export function showPane(name){
  document.querySelectorAll(".pane").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll("[data-pane]").forEach(b=>b.classList.remove("primary"));
  $("#"+name+"Pane").classList.add("active");
  document.querySelector('[data-pane="'+name+'"]')?.classList.add("primary");
}

export function updateAgentPanel(agent){
  setSelectedAgent(agent);
  $("#agentPanel").classList.add("open");
  $("#portrait").textContent=agent.name.slice(0,2).toUpperCase();
  $("#agentName").textContent=agent.name;
  $("#agentRole").textContent=agent.role;
  $("#agentTask").textContent=agent.task;
  const state=$("#agentStatus");
  state.textContent=agent.status.toUpperCase();
  state.className="state "+agent.status;
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
      ?models.length+" modelos carregados do OpenRouter. Digite para pesquisar."
      :models.length+" sugestões carregadas. Você também pode digitar outro slug.";
    status.className="field-note";
  }catch(error){
    status.textContent="Catálogo indisponível: "+error.message+". Digite o slug manualmente.";
    status.className="field-note offline";
  }
}

function updateSettingsUi(){
  $("#provider").value=provider;
  $("#model").value=model;
  $("#apiKey").value=tempKey;\n  $("#rememberKey").checked=rememberKey;
  $("#keyLabel").textContent=provider==="openrouter"
    ?"OpenRouter API Key temporária (opcional)"
    :"Vercel AI Gateway Key temporária (opcional)";
  refreshAiLabels();
}

async function sendMessage(){
  if(aiBusy)return;
  const input=$("#message"),text=input.value.trim();
  if(!text)return;
  const agent=selectedAgent;

  conversation(agent).push({type:"user",text,at:new Date().toISOString()});
  input.value="";saveStore();addLog(agent.name,"USER_MESSAGE",text.slice(0,120));
  setAiBusy(true);$("#send").disabled=true;$("#send").textContent="Pensando...";renderMessages();

  try{
    const headers={"Content-Type":"application/json"};
    if(tempKey)headers["x-agency-ai-key"]=tempKey;
    const response=await fetch("/api/chat",{
      method:"POST",headers,
      body:JSON.stringify({
        provider,model,agent:agent.name,role:agent.role,task:agent.task,
        clientId:"demo-rafaelly-001",message:text,history:conversation(agent).slice(-12)
      })
    });
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Falha ao conversar com a IA");

    conversation(agent).push({type:"agent",agent:agent.name,text:data.reply||"(sem resposta)",response_id:data.response_id});
    if(data.task_update){
      agent.task=data.task_update;
      if(selectedAgent===agent)$("#agentTask").textContent=agent.task;
    }
    addLog(agent.name,"AI_RESPONSE",(data.provider||provider)+" · "+(data.model||model));
    window.__agencyOfficeScene?.showSpeech(agent,data.reply||"");

    if(data.handoff?.to){
      const target=AGENTS.find(a=>a.name.toLowerCase()===String(data.handoff.to).toLowerCase())||AGENTS.find(a=>a.name==="Orion");
      const reason=data.handoff.reason||"delegação";
      const message=data.handoff.message||reason;
      conversation(agent).push({type:"handoff",text:"→ HANDOFF PARA "+target.name+": "+reason});
      conversation(target).push({type:"handoff",agent:agent.name,text:"Handoff de "+agent.name+": "+message});
      const orion=AGENTS.find(a=>a.name==="Orion");
      conversation(orion).push({type:"system",text:"Handoff registrado: "+agent.name+" → "+target.name+". Motivo: "+reason});
      addLog(agent.name,"HANDOFF","→ "+target.name+": "+reason);
      window.__agencyOfficeScene?.showHandoff(agent,target,reason);
    }
    saveStore();
  }catch(error){
    conversation(agent).push({type:"system",text:"Erro de IA: "+error.message+". Abra ⚙ Inteligência e confira gateway, modelo e variável de ambiente."});
    addLog("SYSTEM","AI_ERROR",error.message);saveStore();
  }finally{
    setAiBusy(false);$("#send").disabled=false;$("#send").textContent="Enviar";
    if(selectedAgent===agent)renderMessages();
  }
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
    addLog("SYSTEM","TEMP_KEY_CLEARED","Chave temporária removida da memória.");
  });
}

export function bindUI(){
  $("#closePanel").addEventListener("click",()=>$("#agentPanel").classList.remove("open"));
  $("#openLogs").addEventListener("click",()=>{
    $("#agentPanel").classList.add("open");
    showPane("logs");
  });
  $("#openOrion").addEventListener("click",()=>{
    const orion=AGENTS.find(a=>a.name==="Orion");
    updateAgentPanel(orion);
    showPane("chat");
    window.__agencyOfficeScene?.setSelectedAgent(orion);
  });

  document.querySelectorAll("[data-pane]").forEach(b=>b.addEventListener("click",()=>showPane(b.dataset.pane)));
  bindSettings();

  $("#send").addEventListener("click",sendMessage);
  $("#message").addEventListener("keydown",event=>{
    if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();sendMessage();}
  });

  $("#copyHandoff").addEventListener("click",async()=>{
    const packet={
      schema:"agency-os/handoff-v0.3",client_id:"demo-rafaelly-001",source:"living-office",
      from:"Hianto",to:selectedAgent.name,agent_role:selectedAgent.role,current_task:selectedAgent.task,
      provider,model,conversation:conversation(selectedAgent).slice(-12),return_to:"Orion"
    };
    const text=JSON.stringify(packet,null,2);
    try{await navigator.clipboard.writeText(text);addLog(selectedAgent.name,"HANDOFF_COPIED","Pacote copiado para o ChatGPT.");alert("Handoff copiado.");}
    catch{prompt("Copie o handoff:",text);}
  });

  $("#talkMobile").addEventListener("click",()=>{
    const near=window.__agencyOfficeScene?.nearestAgent();
    if(near)window.__agencyOfficeScene.openAgent(near);
  });

  [["up",-1,-1],["down",1,1],["left",-1,1],["right",1,-1]].forEach(([id,dx,dy])=>{
    $("#"+id).addEventListener("click",()=>window.__agencyOfficeScene?.step(dx,dy));
  });

  window.addEventListener("agency:open-agent",event=>{
    updateAgentPanel(event.detail);showPane("chat");$("#message").focus();
    addLog(event.detail.name,"OPEN_CONVERSATION","Hianto chegou até o agente no escritório.");
  });
  window.addEventListener("agency:log",event=>addLog(event.detail.agent,event.detail.action,event.detail.detail));

  updateAgentPanel(selectedAgent);renderLogs();refreshAiLabels();
  addLog("SYSTEM","OFFICE_READY","Gateway atual: "+provider+" · "+model);
}
