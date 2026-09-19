const DEPTS={
orion:{label:"Diretoria",x:20,y:20,w:240,h:170},
strategy:{label:"Estratégia",x:280,y:20,w:285,h:205},
content:{label:"Conteúdo & Marca",x:585,y:20,w:295,h:205},
growth:{label:"Aquisição & Growth",x:20,y:245,w:285,h:205},
web:{label:"Web & WordPress",x:325,y:245,w:285,h:205},
sales:{label:"Vendas & CRM",x:630,y:245,w:250,h:205},
ai:{label:"IA & Automação",x:20,y:470,w:285,h:190},
qa:{label:"QA & Governança",x:325,y:470,w:255,h:190},
infra:{label:"VPS & Infra",x:600,y:470,w:280,h:190}
};

const AGENTS=[
["Orion","Chief Orchestrator","orion","🧭","working","Coordenando Jobs e handoffs",82],
["Maya","Strategy & Intelligence Lead","strategy","🧠","working","Estratégia do cliente Rafaelly",67],
["Iris","Market Researcher","strategy","🔎","working","Mapeando mercado e concorrentes",54],
["Sofia","Persona & ICP Researcher","strategy","👥","waiting","Aguardando evidências de mercado",25],
["Victor","Offer Strategist","strategy","🎯","waiting","Preparando hipóteses de oferta",18],
["Theo","Account Strategist","strategy","📋","working","Organizando plano de conta",42],
["Luna","Content & Brand Lead","content","🌙","working","Coordenando estratégia editorial",61],
["Nina","Social Media Operator","content","📱","waiting","Aguardando calendário aprovado",28],
["Leo","Copywriter","content","✍️","working","Rascunhando mensagens-chave",45],
["Cora","Content Strategist","content","🗓️","working","Definindo pilares de conteúdo",50],
["Ravi","Creative Strategist","content","💡","waiting","Aguardando briefing criativo",20],
["Mia","Creative Producer","content","🎨","waiting","Fila de criativos",15],
["Bianca","Brand Guardian","content","🛡️","waiting","Aguardando assets para revisão",10],
["Atlas","Acquisition & Growth Lead","growth","📈","working","Planejando aquisição mensurável",58],
["Max","Paid Traffic Operator","growth","📣","blocked","Sem aprovação de mídia",10],
["Hugo","SEO Operator","growth","🔍","working","Preparando auditoria SEO",43],
["Gaia","Local SEO & Google Business","growth","📍","working","Preparando auditoria local",66],
["Eva","GEO & AEO Operator","growth","🤖","waiting","Aguardando mapa de entidades",24],
["Dante","Growth Analyst","growth","🧪","waiting","Aguardando baseline",16],
["Otto","Attribution Analyst","growth","📊","waiting","Aguardando dados analíticos",14],
["Noah","Web & Conversion Lead","web","🌐","working","Arquitetura de conversão",63],
["Ian","Website Builder","web","🧱","waiting","Aguardando briefing aprovado",22],
["Lia","Landing Page Builder","web","🛬","waiting","Aguardando oferta",15],
["Chloe","CRO Specialist","web","🧭","waiting","Aguardando página",8],
["Ben","Web QA","web","✅","waiting","Aguardando build",5],
["Wally","WordPress Solutions Architect","web","🟦","waiting","Disponível para arquitetura WP",12],
["Piper","WordPress Plugin Engineer","web","🔌","waiting","Disponível para plugin/backoffice",9],
["Clara","Sales & CRM Lead","sales","💼","working","Desenhando pipeline comercial",59],
["Alex","Lead Researcher","sales","🕵️","waiting","Aguardando ICP",20],
["Sam","SDR & Outreach Operator","sales","📨","blocked","Outreach externo bloqueado",5],
["Marco","Sales Agent","sales","🤝","waiting","Aguardando oportunidades",12],
["Jade","Follow-up Agent","sales","🔁","waiting","Aguardando conversas",8],
["Emma","CRM Operator","sales","🗃️","working","Estruturando pipeline",47],
["Elise","Email & Lifecycle","sales","✉️","waiting","Aguardando lifecycle",11],
["Ada","AI & Automation Lead","ai","⚙️","working","Projetando automações",64],
["Turing","AI Agent Engineer","ai","🧬","waiting","Disponível para agentes",18],
["Grace","Automation Architect","ai","🔗","working","Mapeando fluxo lead → CRM",51],
["Linus","Integration Engineer","ai","🛠️","waiting","Aguardando providers",14],
["Nova","Context Engineer","ai","🧠","working","Definindo contexto e memória",48],
["SRE","Workflow Reliability Agent","ai","🚦","waiting","Monitorando runtime",31],
["Vera","Quality & Governance Lead","qa","⚖️","working","Auditando primeiro ciclo",71],
["Quinn","Marketing QA","qa","🔬","working","Verificando entregáveis",56],
["Hope","Approval & Risk Controller","qa","🔒","working","Mantendo WRITE/PUBLISH/SPEND bloqueados",77],
["Finn","Performance Auditor","qa","📏","waiting","Aguardando métricas",19],
["Bruno","VPS & Infrastructure Lead","infra","🖥️","working","Monitorando infraestrutura do Agency OS",49],
["Nix","Linux Systems Operator","infra","🐧","waiting","Disponível para Linux",17],
["Dock","Docker & Container Operator","infra","🐳","waiting","Disponível para containers",15],
["Sentinel","Security & Hardening","infra","🛡️","working","Revisando superfície de ataque",38],
["Vault","Backup & Disaster Recovery","infra","🗄️","waiting","Aguardando ambiente de produção",12],
["Pulse","Monitoring & Reliability","infra","💓","working","Preparando observabilidade",41],
["Cesar","FinOps & Infrastructure Pricing","infra","💰","waiting","Disponível para cotações",16],
["Tenant","Multi-Tenant Architect","infra","🏢","waiting","Disponível para isolamento multi-tenant",13]
].map(([name,role,dept,icon,status,task,progress])=>({name,role,dept,icon,status,task,progress}));

const office=document.querySelector("#office");
const logsEl=document.querySelector("#globalLogs");
let selected=AGENTS[0];
const state=JSON.parse(localStorage.getItem("agency-office-state")||'{"messages":{},"logs":[]}');

function save(){localStorage.setItem("agency-office-state",JSON.stringify(state))}
function log(agent,action,detail=""){const row={time:new Date().toLocaleTimeString("pt-BR"),agent,action,detail};state.logs.unshift(row);state.logs=state.logs.slice(0,150);save();renderLogs()}
function renderLogs(){logsEl.innerHTML=state.logs.map(l=>`<div class="log-row"><span class="log-time">${l.time}</span> <span class="log-agent">${l.agent}</span> <span class="log-action">${l.action}</span> ${escapeHtml(l.detail)}</div>`).join("")||'<div class="muted">Nenhum evento ainda.</div>'}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function buildOffice(){
 Object.entries(DEPTS).forEach(([id,d])=>{
  const room=document.createElement("div");room.className="room";room.style.cssText=`left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px`;room.innerHTML=`<span class="room-title">${d.label}</span>`;office.appendChild(room);
  const people=AGENTS.filter(a=>a.dept===id);
  people.forEach((a,i)=>{
   const cols=Math.max(1,Math.floor((d.w-20)/78));const col=i%cols,row=Math.floor(i/cols);
   const x=d.x+10+col*78,y=d.y+34+row*75;
   const desk=document.createElement("div");desk.className="desk";desk.style.cssText=`left:${x}px;top:${y+34}px`;office.appendChild(desk);
   const el=document.createElement("div");el.className=`agent ${a.status}`;el.style.cssText=`left:${x}px;top:${y}px`;el.innerHTML=`<div class="avatar">${a.icon}</div><div class="agent-name">${a.name}</div><div class="agent-task">${escapeHtml(a.task)}</div>${a.status==="working"?'<span class="bubble">LIVE</span>':""}`;el.onclick=()=>selectAgent(a);office.appendChild(el);
  });
 });
 document.querySelector("#activeCount").textContent=AGENTS.filter(a=>a.status==="working").length;
}

function selectAgent(a){
 selected=a;
 document.querySelector("#agentName").textContent=a.name;
 document.querySelector("#agentRole").textContent=a.role;
 const st=document.querySelector("#agentStatus");st.textContent=a.status.toUpperCase();st.className=`status ${a.status}`;
 document.querySelector("#agentTask").textContent=a.task;
 document.querySelector("#taskProgress").style.width=a.progress+"%";
 renderChat();renderActivity();renderHandoff();
 log(a.name,"OPEN_AGENT","Hianto abriu a estação do agente.");
}

function messages(){return state.messages[selected.name]||(state.messages[selected.name]=[
 {type:"agent",text:`Sou ${selected.name}. Meu papel no Agency OS é ${selected.role}. Esta interface local registra nossa conversa e prepara o handoff para o runtime/ChatGPT; ela não inventa uma resposta de IA no navegador.`}
])}

function renderChat(){
 document.querySelector("#chatLog").innerHTML=messages().map(m=>`<div class="msg ${m.type}">${escapeHtml(m.text)}</div>`).join("");
 document.querySelector("#chatLog").scrollTop=99999;
}

function send(){
 const input=document.querySelector("#messageInput");const text=input.value.trim();if(!text)return;
 messages().push({type:"user",text,at:new Date().toISOString()});
 messages().push({type:"system",text:"Mensagem registrada. Gere o handoff para processar isto com o agente real no Agency OS/ChatGPT."});
 input.value="";save();renderChat();renderHandoff();log(selected.name,"MESSAGE_CAPTURED",text.slice(0,90));
}

function handoffObject(){
 const history=messages().filter(m=>m.type!=="system").slice(-12);
 return {
  schema:"agency-os/handoff-v0.1",
  created_at:new Date().toISOString(),
  source:"agency-office-2d",
  client_id:document.querySelector("#clientSelect").value,
  job_id:"job-demo-rafaelly-001",
  from:"Hianto",
  to:selected.name,
  agent_role:selected.role,
  current_task:selected.task,
  intent:"Continue esta conversa como o agente selecionado e devolva resultado + próximo handoff quando necessário.",
  conversation:history,
  approval_context:{write:"approval",publish:"approval",spend:"approval",delete:"approval"},
  return_to:"Orion"
 };
}
function renderHandoff(){document.querySelector("#handoffPreview").value=JSON.stringify(handoffObject(),null,2)}
function generateHandoff(){renderHandoff();log(selected.name,"HANDOFF_GENERATED","Pacote pronto para execução pelo Agency OS/ChatGPT.")}
async function copyHandoff(){generateHandoff();await navigator.clipboard.writeText(document.querySelector("#handoffPreview").value);log(selected.name,"HANDOFF_COPIED","Handoff copiado para colar no ChatGPT.");alert("Handoff copiado. Cole nesta conversa do ChatGPT e eu continuo exatamente deste agente.");}
function routeOrion(){
 const packet=handoffObject();packet.to="Orion";packet.intent=`Orion, processe a solicitação destinada originalmente a ${selected.name}; preserve a autoria e delegue/devolva ao agente correto.`;
 state.messages.Orion=state.messages.Orion||[];state.messages.Orion.push({type:"system",text:`Handoff recebido de ${selected.name}: ${messages().filter(m=>m.type==="user").at(-1)?.text||"sem mensagem nova"}`});save();log("Orion","HANDOFF_RECEIVED",`Origem: ${selected.name}`);selectAgent(AGENTS[0]);
}
function renderActivity(){
 const items=[
  `STATUS · ${selected.status.toUpperCase()}`,
  `TASK · ${selected.task}`,
  `PROGRESS · ${selected.progress}%`,
  ...state.logs.filter(l=>l.agent===selected.name).slice(0,8).map(l=>`${l.time} · ${l.action} · ${l.detail}`)
 ];
 document.querySelector("#agentActivity").innerHTML=items.map(x=>`<div class="activity-item">${escapeHtml(x)}</div>`).join("");
}

document.querySelector("#sendMessage").onclick=send;
document.querySelector("#messageInput").addEventListener("keydown",e=>{if(e.ctrlKey&&e.key==="Enter")send()});
document.querySelector("#generateHandoff").onclick=generateHandoff;
document.querySelector("#copyHandoff").onclick=copyHandoff;
document.querySelector("#routeToOrion").onclick=routeOrion;
document.querySelector("#openOrion").onclick=()=>selectAgent(AGENTS[0]);
document.querySelector("#toggleLogs").onclick=()=>document.querySelector("#logsDrawer").classList.add("open");
document.querySelector("#closeLogs").onclick=()=>document.querySelector("#logsDrawer").classList.remove("open");
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".tab,.tabpane").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.querySelector("#"+btn.dataset.tab+"Tab").classList.add("active")});
setInterval(()=>document.querySelector("#clock").textContent=new Date().toLocaleTimeString("pt-BR"),1000);
buildOffice();renderLogs();selectAgent(selected);
log("SYSTEM","OFFICE_BOOT","Agency OS Office iniciado em modo local/handoff.");
