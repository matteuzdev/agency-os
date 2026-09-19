const canvas=document.querySelector("#game");
const ctx=canvas.getContext("2d");
const W=1600,H=1000;
canvas.width=W;canvas.height=H;

const rooms=[
 {id:"strategy",name:"ESTRATÉGIA",x:40,y:80,w:450,h:250,c:"#18253a"},
 {id:"orion",name:"DIREÇÃO · ORION",x:570,y:55,w:460,h:210,c:"#1c2740"},
 {id:"content",name:"CONTEÚDO & MARCA",x:1110,y:80,w:450,h:250,c:"#251f3d"},
 {id:"growth",name:"AQUISIÇÃO & GROWTH",x:40,y:380,w:450,h:250,c:"#1a2b28"},
 {id:"web",name:"WEB & WORDPRESS",x:570,y:345,w:460,h:285,c:"#182a36"},
 {id:"sales",name:"VENDAS & CRM",x:1110,y:380,w:450,h:250,c:"#2a241b"},
 {id:"ai",name:"IA & AUTOMAÇÃO",x:40,y:700,w:450,h:250,c:"#20243b"},
 {id:"qa",name:"QA & GOVERNANÇA",x:570,y:700,w:460,h:250,c:"#2b1f2b"},
 {id:"infra",name:"VPS & INFRA",x:1110,y:700,w:450,h:250,c:"#222a20"}
];

const rawAgents=[
["Orion","Chief Orchestrator","orion","Coordena Jobs, decisões e handoffs",800,150,"working"],
["Maya","Strategy & Intelligence Lead","strategy","Estratégia e posicionamento",135,155,"working"],
["Iris","Market Researcher","strategy","Pesquisa mercado e concorrentes",260,155,"working"],
["Sofia","Persona & ICP Researcher","strategy","ICP, JTBD e objeções",385,155,"waiting"],
["Victor","Offer Strategist","strategy","Oferta e proposta de valor",195,255,"waiting"],
["Theo","Account Strategist","strategy","Plano de conta e KPIs",335,255,"working"],
["Luna","Content & Brand Lead","content","Coordena conteúdo e marca",1210,155,"working"],
["Nina","Social Media Operator","content","Calendário e operação social",1340,155,"working"],
["Leo","Copywriter","content","Copy, hooks e scripts",1470,155,"working"],
["Cora","Content Strategist","content","Pilares e distribuição",1210,255,"working"],
["Ravi","Creative Strategist","content","Ângulos e direção criativa",1340,255,"waiting"],
["Mia","Creative Producer","content","Produção de criativos",1470,255,"waiting"],
["Atlas","Acquisition & Growth Lead","growth","Aquisição mensurável",135,455,"working"],
["Max","Paid Traffic Operator","growth","Mídia paga e campanhas",260,455,"blocked"],
["Hugo","SEO Operator","growth","SEO técnico e orgânico",385,455,"working"],
["Gaia","Local SEO & Google Business","growth","Presença local e Google Business",195,565,"working"],
["Eva","GEO & AEO Operator","growth","Busca generativa e resposta",335,565,"waiting"],
["Noah","Web & Conversion Lead","web","Sites e conversão",650,420,"working"],
["Ian","Website Builder","web","Construção de sites",780,420,"waiting"],
["Lia","Landing Page Builder","web","Landing pages",910,420,"waiting"],
["Wally","WordPress Solutions Architect","web","Arquitetura WordPress",650,545,"working"],
["Piper","WordPress Plugin Engineer","web","Plugins e backoffice",780,545,"waiting"],
["Chloe","CRO Specialist","web","Otimização de conversão",910,545,"waiting"],
["Clara","Sales & CRM Lead","sales","Pipeline, vendas e CRM",1210,455,"working"],
["Alex","Lead Researcher","sales","Pesquisa e enriquecimento",1340,455,"waiting"],
["Sam","SDR & Outreach Operator","sales","Outreach e qualificação",1470,455,"blocked"],
["Marco","Sales Agent","sales","Vendas e objeções",1210,565,"waiting"],
["Emma","CRM Operator","sales","Higiene do pipeline",1340,565,"working"],
["Jade","Follow-up Agent","sales","Follow-up contextual",1470,565,"waiting"],
["Ada","AI & Automation Lead","ai","Agentes e automações",135,775,"working"],
["Turing","AI Agent Engineer","ai","Engenharia de agentes",260,775,"waiting"],
["Grace","Automation Architect","ai","Workflows e automações",385,775,"working"],
["Linus","Integration Engineer","ai","APIs e adapters",135,885,"waiting"],
["Nova","Context Engineer","ai","Contexto e memória",260,885,"working"],
["SRE","Workflow Reliability","ai","Confiabilidade de workflows",385,885,"waiting"],
["Vera","Quality & Governance Lead","qa","QA, governança e performance",650,775,"working"],
["Quinn","Marketing QA","qa","Verifica entregáveis",780,775,"working"],
["Hope","Approval & Risk Controller","qa","Approval Gate e risco",910,775,"working"],
["Finn","Performance Auditor","qa","Audita performance e evidência",780,885,"waiting"],
["Bruno","VPS & Infrastructure Lead","infra","VPS, Linux e infraestrutura",1210,775,"working"],
["Nix","Linux Systems Operator","infra","Linux, systemd e filesystem",1340,775,"waiting"],
["Dock","Docker & Container Operator","infra","Docker e containers",1470,775,"waiting"],
["Sentinel","Security & Hardening","infra","Hardening e acesso",1210,885,"working"],
["Vault","Backup & Disaster Recovery","infra","Backup e restore",1340,885,"waiting"],
["Pulse","Monitoring & Reliability","infra","Logs, métricas e alertas",1470,885,"working"]
];
const agents=rawAgents.map(a=>({name:a[0],role:a[1],dept:a[2],task:a[3],x:a[4],y:a[5],status:a[6]}));
agents.push({name:"Cesar",role:"FinOps & Infrastructure Pricing",dept:"infra",task:"Custos e cotações de infraestrutura",x:1140,y:885,status:"waiting"});
agents.push({name:"Tenant",role:"Multi-Tenant Infrastructure Architect",dept:"infra",task:"Isolamento e provisionamento multi-tenant",x:1540,y:885,status:"waiting"});

const player={x:800,y:300,r:18,speed:250,dir:"down"};
const keys=new Set();
let nearest=null;
let selected=agents.find(a=>a.name==="Orion");
let aiKey="";
let model=localStorage.getItem("agency-model")||"openai/gpt-5.6-sol";
let aiBusy=false;
const store=JSON.parse(localStorage.getItem("agency-game-state")||'{"messages":{},"logs":[]}');

const $=s=>document.querySelector(s);
function save(){localStorage.setItem("agency-game-state",JSON.stringify(store))}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addLog(agent,action,detail=""){
 const item={time:new Date().toLocaleTimeString("pt-BR"),agent,action,detail};
 store.logs.unshift(item);store.logs=store.logs.slice(0,180);save();renderLogs();
}
function conv(agent){return store.messages[agent.name]||(store.messages[agent.name]=[
 {type:"agent",agent:agent.name,text:`Oi, Hianto. Sou ${agent.name}, ${agent.role}. Chegue perto da minha mesa e fale comigo. Quando a IA estiver conectada, esta conversa é processada pelo meu papel real no Agency OS.`}
])}
function renderMessages(){
 $("#messages").innerHTML=conv(selected).map(m=>`<div class="msg ${m.type||"agent"}">${esc(m.text)}</div>`).join("");
 $("#panel").scrollTop=$("#panel").scrollHeight;
}
function renderLogs(){
 $("#logs").innerHTML=(store.logs.length?store.logs:[{time:"--:--",agent:"SYSTEM",action:"READY",detail:"Nenhum evento ainda."}]).map(l=>`<div class="log"><span>${esc(l.time)}</span> · <b>${esc(l.agent)}</b> · ${esc(l.action)}<br>${esc(l.detail)}</div>`).join("");
}
function selectAgent(agent,source="interaction"){
 selected=agent;
 $("#portrait").textContent=agent.name.slice(0,2).toUpperCase();
 $("#agentName").textContent=agent.name;
 $("#agentRole").textContent=agent.role;
 $("#agentTask").textContent=agent.task;
 $("#agentStatus").textContent=agent.status.toUpperCase();
 renderMessages();
 addLog(agent.name,"OPEN_CONVERSATION",source==="walk"?"Hianto chegou à mesa do agente.":"Agente selecionado.");
 showPane("chat");
}
function showPane(name){
 document.querySelectorAll(".pane").forEach(p=>p.classList.remove("active"));
 document.querySelectorAll("[data-pane]").forEach(b=>b.classList.remove("primary"));
 $("#"+name+"Pane").classList.add("active");
 document.querySelector(`[data-pane="${name}"]`)?.classList.add("primary");
}
document.querySelectorAll("[data-pane]").forEach(b=>b.addEventListener("click",()=>showPane(b.dataset.pane)));

function drawRoom(r){
 ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);
 ctx.strokeStyle="#3a4b63";ctx.lineWidth=3;ctx.strokeRect(r.x,r.y,r.w,r.h);
 ctx.fillStyle="#9db0cc";ctx.font="700 17px system-ui";ctx.fillText(r.name,r.x+18,r.y+28);
}
function drawDesk(a){
 ctx.fillStyle="#65452f";ctx.fillRect(a.x-34,a.y+18,68,35);
 ctx.fillStyle="#16253a";ctx.fillRect(a.x-20,a.y+21,40,20);
 ctx.strokeStyle="#76a8e8";ctx.strokeRect(a.x-20,a.y+21,40,20);
}
function drawNpc(a){
 const sel=a===selected;
 ctx.save();
 if(sel){ctx.strokeStyle="#ffe08a";ctx.lineWidth=4;ctx.beginPath();ctx.arc(a.x,a.y,29,0,Math.PI*2);ctx.stroke()}
 ctx.fillStyle=a.status==="blocked"?"#8c3d43":a.status==="working"?"#2d7f5a":"#735f2f";
 ctx.fillRect(a.x-13,a.y-13,26,26);
 ctx.fillStyle="#f0c6a8";ctx.fillRect(a.x-9,a.y-25,18,14);
 ctx.fillStyle="#e9f0fa";ctx.font="700 12px system-ui";ctx.textAlign="center";ctx.fillText(a.name,a.x,a.y-35);
 ctx.fillStyle=a.status==="working"?"#69e099":a.status==="blocked"?"#ff8585":"#efc46d";ctx.beginPath();ctx.arc(a.x+18,a.y-25,5,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function drawPlayer(){
 ctx.save();ctx.translate(player.x,player.y);
 ctx.fillStyle="#4c8df6";ctx.fillRect(-14,-12,28,29);
 ctx.fillStyle="#f0c6a8";ctx.fillRect(-10,-27,20,17);
 ctx.fillStyle="#101827";
 if(player.dir==="left")ctx.fillRect(-9,-22,3,3);
 else if(player.dir==="right")ctx.fillRect(6,-22,3,3);
 else {ctx.fillRect(-6,-22,3,3);ctx.fillRect(4,-22,3,3)}
 ctx.restore();
 ctx.fillStyle="#ffffff";ctx.font="700 12px system-ui";ctx.textAlign="center";ctx.fillText("HIANTO",player.x,player.y+36);
}
function drawDecor(){
 ctx.fillStyle="#1b2637";ctx.fillRect(0,0,W,H);
 ctx.strokeStyle="#202e43";ctx.lineWidth=1;
 for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 rooms.forEach(drawRoom);
 ctx.fillStyle="#263850";ctx.fillRect(510,0,40,H);ctx.fillRect(1050,0,40,H);
 ctx.fillRect(0,650,W,28);ctx.fillRect(0,340,W,22);
 ctx.fillStyle="#31435d";ctx.fillRect(730,12,140,26);ctx.fillRect(730,958,140,26);
}
function loop(ts){
 const dt=Math.min(0.032,(ts-(loop.last||ts))/1000);loop.last=ts;
 update(dt);render();requestAnimationFrame(loop);
}
function update(dt){
 if(document.activeElement && ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)){nearest=findNearest();return}
 let dx=0,dy=0;
 if(keys.has("ArrowLeft")||keys.has("a")){dx--;player.dir="left"}
 if(keys.has("ArrowRight")||keys.has("d")){dx++;player.dir="right"}
 if(keys.has("ArrowUp")||keys.has("w")){dy--;player.dir="up"}
 if(keys.has("ArrowDown")||keys.has("s")){dy++;player.dir="down"}
 if(dx||dy){const len=Math.hypot(dx,dy);player.x+=dx/len*player.speed*dt;player.y+=dy/len*player.speed*dt}
 player.x=Math.max(26,Math.min(W-26,player.x));player.y=Math.max(45,Math.min(H-30,player.y));
 nearest=findNearest();
 $("#interact").style.display=nearest?"block":"none";
 $("#interact").textContent=nearest?`E · Falar com ${nearest.name}`:"";
}
function findNearest(){
 let best=null,dist=Infinity;
 for(const a of agents){const d=Math.hypot(a.x-player.x,a.y-player.y);if(d<78&&d<dist){best=a;dist=d}}
 return best;
}
function render(){
 drawDecor();
 agents.forEach(drawDesk);agents.forEach(drawNpc);drawPlayer();
}
window.addEventListener("keydown",e=>{
 if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
 keys.add(e.key.length===1?e.key.toLowerCase():e.key);
 if(e.key.toLowerCase()==="e"&&nearest){selectAgent(nearest,"walk");$("#message").focus()}
});
window.addEventListener("keyup",e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

async function sendMessage(){
 if(aiBusy)return;
 const input=$("#message"),text=input.value.trim();if(!text)return;
 conv(selected).push({type:"user",text,at:new Date().toISOString()});input.value="";save();renderMessages();
 addLog(selected.name,"USER_MESSAGE",text.slice(0,120));
 aiBusy=true;$("#send").disabled=true;$("#send").textContent="Pensando...";
 try{
  const headers={"Content-Type":"application/json"};if(aiKey)headers["x-agency-ai-key"]=aiKey;
  const resp=await fetch("/api/chat",{method:"POST",headers,body:JSON.stringify({
   agent:selected.name,role:selected.role,task:selected.task,clientId:$("#client").value,
   message:text,model,history:conv(selected).slice(-12)
  })});
  const data=await resp.json();
  if(!resp.ok)throw new Error(data.error||"Falha ao conversar com a IA");
  conv(selected).push({type:"agent",agent:selected.name,text:data.reply||"(sem resposta)",response_id:data.response_id});
  if(data.task_update){selected.task=data.task_update;$("#agentTask").textContent=selected.task}
  addLog(selected.name,"AI_RESPONSE",`modelo ${data.model||model}`);
  if(data.handoff?.to){
    const target=agents.find(a=>a.name.toLowerCase()===String(data.handoff.to).toLowerCase())||agents.find(a=>a.name==="Orion");
    const msg=`Handoff de ${selected.name}: ${data.handoff.message||data.handoff.reason||"Sem contexto adicional"}`;
    conv(selected).push({type:"handoff",text:`→ HANDOFF PARA ${target.name}: ${data.handoff.reason||"delegação"}`});
    conv(target).push({type:"handoff",agent:selected.name,text:msg});
    conv(agents.find(a=>a.name==="Orion")).push({type:"system",text:`Handoff registrado: ${selected.name} → ${target.name}. Motivo: ${data.handoff.reason||"delegação"}`});
    addLog(selected.name,"HANDOFF",`→ ${target.name}: ${data.handoff.reason||"delegação"}`);
  }
  save();renderMessages();
 }catch(err){
  conv(selected).push({type:"system",text:`Erro de IA: ${err.message}. Abra ⚙ IA para configurar a chave ou confira a variável AI_GATEWAY_API_KEY na Vercel.`});
  addLog("SYSTEM","AI_ERROR",err.message);save();renderMessages();
 }finally{aiBusy=false;$("#send").disabled=false;$("#send").textContent="Enviar"}
}
$("#send").addEventListener("click",sendMessage);
$("#message").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}});
$("#talkBtn").addEventListener("click",()=>{if(nearest){selectAgent(nearest,"walk");$("#message").focus()}});
for(const [id,key] of [["up","ArrowUp"],["down","ArrowDown"],["left","ArrowLeft"],["right","ArrowRight"]]){
 const b=$("#"+id);b.addEventListener("pointerdown",()=>keys.add(key));["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>keys.delete(key)));
}

function openSettings(){
 $("#settings").classList.add("open");
 $("#apiKey").value=aiKey;
 $("#model").value=model;
}
$("#settingsBtn").addEventListener("click",openSettings);
$("#closeSettings").addEventListener("click",()=>$("#settings").classList.remove("open"));
$("#saveSettings").addEventListener("click",()=>{
 aiKey=$("#apiKey").value.trim();
 model=$("#model").value;
 localStorage.setItem("agency-model",model);
 $("#settings").classList.remove("open");
 $("#aiState").textContent=aiKey?"chave temporária ativa":"usando Vercel env";
 $("#aiState").className=aiKey?"online":"badge";
 addLog("SYSTEM","AI_SETTINGS",`Modelo: ${model}; credencial: ${aiKey?"Gateway key temporária":"Vercel env"}`);
});
$("#clearKey").addEventListener("click",()=>{aiKey="";$("#apiKey").value="";$("#aiState").textContent="usando Vercel env";addLog("SYSTEM","API_KEY_CLEARED","Chave temporária removida da memória.")});
$("#copyHandoff").addEventListener("click",async()=>{
 const packet={schema:"agency-os/handoff-v0.2",client_id:$("#client").value,from:"Hianto",to:selected.name,agent_role:selected.role,current_task:selected.task,conversation:conv(selected).slice(-12),return_to:"Orion"};
 const txt=JSON.stringify(packet,null,2);
 try{await navigator.clipboard.writeText(txt);addLog(selected.name,"HANDOFF_COPIED","Pacote copiado para ChatGPT.");alert("Handoff copiado para colar no ChatGPT.")}catch{prompt("Copie o handoff:",txt)}
});

$("#client").addEventListener("change",()=>addLog("Orion","CLIENT_SWITCH",$("#client").value));
$("#reset").addEventListener("click",()=>{if(confirm("Limpar conversas e logs locais do Office?")){localStorage.removeItem("agency-game-state");location.reload()}});

selectAgent(selected,"boot");renderLogs();addLog("SYSTEM","GAME_BOOT","Office 2D iniciado. Use WASD/setas, aproxime-se de um agente e pressione E.");
requestAnimationFrame(loop);
