const AGENT_RULES = {
  Orion: "Você é o Chief Orchestrator. Coordene departamentos, preserve contexto, delegue por capacidade e exija evidência antes de declarar execução.",
  Vera: "Você é Quality, Governance & Performance Lead. Verifique riscos, QA, evidências e bloqueie ações externas inseguras.",
  Hope: "Você é Approval & Risk Controller. WRITE, PUBLISH, SPEND e DELETE exigem aprovação quando a política assim determinar.",
  Bruno: "Você é VPS & Infrastructure Lead. Inspecione antes de mudar, use rollback, backup antes de risco e nunca exponha segredos.",
  Mia: "Você é Creative Producer. Produza direção/briefs criativos e assets quando a capacidade de imagem estiver disponível.",
  Wally: "Você é WordPress Solutions Architect. Trate WordPress como plataforma; lógica de negócio em plugins, least privilege, staging antes de produção."
};

function systemPrompt({agent,role,task,clientId}) {
  return [
    "Você está operando dentro do Agency OS, uma agência de IA representada por um escritório 2D jogável.",
    `Seu nome é ${agent}. Seu cargo é ${role}. Tarefa atual: ${task}. Cliente/contexto: ${clientId}.`,
    AGENT_RULES[agent] || "Atue estritamente dentro do seu papel profissional e das políticas do Agency OS.",
    "Handoff é prioridade: quando outro agente for claramente mais adequado, faça handoff em vez de fingir especialidade.",
    "Ações externas não devem ser alegadas como executadas sem ferramenta/evidência real.",
    "READ e DRAFT podem avançar; WRITE/PUBLISH/SPEND/DELETE devem respeitar aprovação.",
    "Responda em português do Brasil, direto, profissional e natural.",
    "Retorne SOMENTE JSON válido:",
    '{"reply":"resposta","handoff":null,"status":"working","task_update":"resumo curto"}',
    'ou {"reply":"resposta","handoff":{"to":"NomeDoAgente","reason":"motivo","message":"contexto"},"status":"handoff","task_update":"resumo curto"}'
  ].join("\n");
}

function normalizeMessages(history, message, prompt) {
  const messages=[{role:"system",content:prompt}];
  for (const m of history.slice(-12)) {
    const role=m.type==="user"?"user":"assistant";
    messages.push({role,content:String(m.text||"").slice(0,6000)});
  }
  messages.push({role:"user",content:message});
  return messages;
}

function parseAgentPayload(raw, task) {
  let parsed;
  try { parsed=JSON.parse(raw); }
  catch { parsed={reply:raw||"Resposta vazia.",handoff:null,status:"working",task_update:task}; }
  return {
    reply:String(parsed.reply||raw||""),
    handoff:parsed.handoff||null,
    status:parsed.status||"working",
    task_update:parsed.task_update||task
  };
}

async function callOpenRouter({key,model,messages}) {
  const response=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${key}`,
      "Content-Type":"application/json",
      "HTTP-Referer":process.env.AGENCY_OS_URL||"https://agency-os.vercel.app",
      "X-Title":"Agency OS Office"
    },
    body:JSON.stringify({
      model,
      messages,
      response_format:{type:"json_object"}
    })
  });
  const data=await response.json();
  if(!response.ok) throw Object.assign(new Error(data?.error?.message||"Falha no OpenRouter"),{status:response.status});
  return {raw:data?.choices?.[0]?.message?.content||"",id:data?.id||null,model:data?.model||model};
}

function extractResponsesText(data) {
  if (typeof data?.output_text==="string" && data.output_text.trim()) return data.output_text.trim();
  const out=Array.isArray(data?.output)?data.output:[];
  return out.flatMap(item=>Array.isArray(item?.content)?item.content:[])
    .filter(c=>c?.type==="output_text"&&typeof c.text==="string")
    .map(c=>c.text).join("\n").trim();
}

async function callVercelGateway({key,model,prompt,history,message}) {
  const transcript=history.slice(-12).map(m=>`${m.type==="user"?"Hianto":"Agente"}: ${String(m.text||"").slice(0,6000)}`).join("\n");
  const response=await fetch("https://ai-gateway.vercel.sh/v1/responses",{
    method:"POST",
    headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
    body:JSON.stringify({model,instructions:prompt,input:`Histórico:\n${transcript||"(sem histórico)"}\n\nHianto: ${message}`})
  });
  const data=await response.json();
  if(!response.ok) throw Object.assign(new Error(data?.error?.message||"Falha no Vercel AI Gateway"),{status:response.status});
  return {raw:extractResponsesText(data),id:data?.id||null,model};
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const body=req.body||{};
  const provider=String(body.provider||"openrouter").toLowerCase();
  const agent=String(body.agent||"Orion");
  const role=String(body.role||"Agency OS Agent");
  const task=String(body.task||"Aguardando tarefa");
  const clientId=String(body.clientId||"default");
  const message=String(body.message||"").trim();
  const history=Array.isArray(body.history)?body.history:[];
  if(!message) return res.status(400).json({error:"Mensagem vazia"});

  const temporaryKey=req.headers["x-agency-ai-key"];
  let key,model,result;

  try{
    const prompt=systemPrompt({agent,role,task,clientId});

    if(provider==="openrouter"){
      key=temporaryKey||process.env.OPENROUTER_API_KEY;
      if(!key) return res.status(401).json({error:"OpenRouter sem chave. Configure OPENROUTER_API_KEY na Vercel ou informe uma chave temporária no Office."});
      model=String(body.model||process.env.OPENROUTER_MODEL_DEFAULT||"openrouter/auto");
      result=await callOpenRouter({key,model,messages:normalizeMessages(history,message,prompt)});
    } else if(provider==="vercel"){
      key=temporaryKey||process.env.AI_GATEWAY_API_KEY;
      if(!key) return res.status(401).json({error:"Vercel AI Gateway sem chave. Configure AI_GATEWAY_API_KEY na Vercel ou informe uma chave temporária no Office."});
      model=String(body.model||process.env.AI_MODEL_DEFAULT||"openai/gpt-5.4");
      result=await callVercelGateway({key,model,prompt,history,message});
    } else {
      return res.status(400).json({error:"Gateway inválido. Use openrouter ou vercel."});
    }

    const parsed=parseAgentPayload(result.raw,task);
    return res.status(200).json({
      provider,
      agent,
      model:result.model||model,
      ...parsed,
      response_id:result.id
    });
  }catch(error){
    return res.status(error.status||500).json({error:String(error?.message||error),provider});
  }
}