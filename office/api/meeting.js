function parseJson(raw){
  try{return JSON.parse(raw);}
  catch{return {turns:[{agent:"Orion",text:String(raw||"Resposta vazia.")}],summary:"",actions:[]};}
}
function extractResponsesText(data){
  if(typeof data?.output_text==="string"&&data.output_text.trim())return data.output_text.trim();
  const out=Array.isArray(data?.output)?data.output:[];
  return out.flatMap(item=>Array.isArray(item?.content)?item.content:[])
    .filter(c=>c?.type==="output_text"&&typeof c.text==="string")
    .map(c=>c.text).join("\n").trim();
}
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const body=req.body||{};
  const provider=String(body.provider||"openrouter").toLowerCase();
  const participants=Array.isArray(body.participants)?body.participants.slice(0,8):[];
  const history=Array.isArray(body.history)?body.history.slice(-20):[];
  const message=String(body.message||"").trim();
  const topic=String(body.topic||"Reunião do Agency OS");
  if(!participants.length||!message)return res.status(400).json({error:"Participantes e mensagem são obrigatórios."});

  const roster=participants.map(p=>`- ${p.name}: ${p.role}. Tarefa atual: ${p.task||"n/a"}`).join("\n");
  const transcript=history.map(m=>`${m.agent||m.role||"Hianto"}: ${String(m.text||"").slice(0,4000)}`).join("\n");
  const prompt=[
    "Você está conduzindo uma reunião dentro do Agency OS.",
    "Cada participante é um agente operacional distinto. Não misture papéis.",
    "Responda somente com JSON válido.",
    '{"turns":[{"agent":"Nome","text":"fala objetiva"}],"summary":"resumo curto","actions":[{"agent":"Nome","kind":"internal|browser_use|computer_use","action":"ação proposta","risk":"READ|DRAFT|WRITE|PUBLISH|SPEND|DELETE"}]}',
    "Browser Use/Computer Use podem ser PROPOSTOS, mas não diga que foram executados sem receipt/evidência real.",
    "WRITE/PUBLISH/SPEND/DELETE exigem approval conforme política.",
    "Participantes:\n"+roster,
    "Tema: "+topic,
    "Histórico:\n"+(transcript||"(sem histórico)"),
    "Hianto: "+message
  ].join("\n\n");

  try{
    let raw="",id=null,usedModel="";
    const tempKey=req.headers["x-agency-ai-key"];
    if(provider==="openrouter"){
      const key=tempKey||process.env.OPENROUTER_API_KEY;
      if(!key)return res.status(401).json({error:"OPENROUTER_API_KEY não configurada."});
      usedModel=String(body.model||process.env.OPENROUTER_MODEL_DEFAULT||"openrouter/auto");
      const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
        method:"POST",
        headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json","X-Title":"Agency OS Meeting"},
        body:JSON.stringify({model:usedModel,messages:[{role:"user",content:prompt}]})
      });
      const data=await r.json();
      if(!r.ok)throw Object.assign(new Error(data?.error?.message||"Falha no OpenRouter"),{status:r.status});
      raw=data?.choices?.[0]?.message?.content||"";id=data?.id||null;usedModel=data?.model||usedModel;
    }else if(provider==="vercel"){
      const key=tempKey||process.env.AI_GATEWAY_API_KEY;
      if(!key)return res.status(401).json({error:"AI_GATEWAY_API_KEY não configurada."});
      usedModel=String(body.model||process.env.AI_MODEL_DEFAULT||"openai/gpt-5.4");
      const r=await fetch("https://ai-gateway.vercel.sh/v1/responses",{
        method:"POST",
        headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
        body:JSON.stringify({model:usedModel,input:prompt})
      });
      const data=await r.json();
      if(!r.ok)throw Object.assign(new Error(data?.error?.message||"Falha no Vercel AI Gateway"),{status:r.status});
      raw=extractResponsesText(data);id=data?.id||null;
    }else return res.status(400).json({error:"Gateway inválido."});

    const parsed=parseJson(raw);
    return res.status(200).json({
      provider,model:usedModel,response_id:id,
      turns:Array.isArray(parsed.turns)?parsed.turns:[],
      summary:String(parsed.summary||""),
      actions:Array.isArray(parsed.actions)?parsed.actions:[]
    });
  }catch(error){
    return res.status(error.status||500).json({error:String(error?.message||error)});
  }
}