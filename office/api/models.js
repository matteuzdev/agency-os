export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const provider=String(req.query?.provider||"openrouter").toLowerCase();

  if(provider==="openrouter"){
    try{
      const response=await fetch("https://openrouter.ai/api/v1/models");
      const data=await response.json();
      if(!response.ok) return res.status(response.status).json({error:"Falha ao carregar modelos do OpenRouter"});
      const models=(Array.isArray(data?.data)?data.data:[])
        .map(m=>({
          id:m.id,
          name:m.name||m.id,
          context_length:m.context_length||null,
          pricing:m.pricing||null,
          architecture:m.architecture||null
        }))
        .sort((a,b)=>a.id.localeCompare(b.id));
      res.setHeader("Cache-Control","s-maxage=600, stale-while-revalidate=3600");
      return res.status(200).json({provider:"openrouter",models});
    }catch(error){
      return res.status(500).json({error:String(error?.message||error)});
    }
  }

  if(provider==="vercel"){
    const models=[
      {id:"openai/gpt-5.4",name:"OpenAI GPT-5.4"},
      {id:"anthropic/claude-sonnet-4.6",name:"Anthropic Claude Sonnet 4.6"},
      {id:"google/gemini-3-flash",name:"Google Gemini 3 Flash"}
    ];
    return res.status(200).json({provider:"vercel",models,note:"Você também pode digitar manualmente qualquer slug disponível no AI Gateway."});
  }

  return res.status(400).json({error:"Provider inválido"});
}