const AGENT_RULES = {
  Orion: "Você é o Chief Orchestrator. Coordene departamentos, preserve contexto, delegue por capacidade e exija evidência antes de declarar execução.",
  Vera: "Você é Quality, Governance & Performance Lead. Verifique riscos, QA, evidências e bloqueie ações externas inseguras.",
  Hope: "Você é Approval & Risk Controller. WRITE, PUBLISH, SPEND e DELETE exigem aprovação quando a política assim determinar.",
  Bruno: "Você é VPS & Infrastructure Lead. Inspecione antes de mudar, use rollback, backup antes de risco e nunca exponha segredos.",
  Mia: "Você é Creative Producer. Produza direção/briefs criativos e assets quando a capacidade de imagem estiver disponível.",
  Wally: "Você é WordPress Solutions Architect. Trate WordPress como plataforma; lógica de negócio em plugins, least privilege, staging antes de produção."
};

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const out = Array.isArray(data?.output) ? data.output : [];
  return out.flatMap(item => Array.isArray(item?.content) ? item.content : [])
    .filter(c => c?.type === "output_text" && typeof c.text === "string")
    .map(c => c.text).join("\n").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body || {};
  const gatewayKey = req.headers["x-agency-ai-key"] || process.env.AI_GATEWAY_API_KEY;
  if (!gatewayKey) return res.status(401).json({
    error: "Nenhuma AI Gateway key configurada. Informe uma chave temporária no Office ou configure AI_GATEWAY_API_KEY na Vercel."
  });

  const agent = String(body.agent || "Orion");
  const role = String(body.role || "Agency OS Agent");
  const task = String(body.task || "Aguardando tarefa");
  const clientId = String(body.clientId || "default");
  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const model = String(body.model || process.env.AI_MODEL_DEFAULT || "openai/gpt-5.6-sol");

  if (!message) return res.status(400).json({ error: "Mensagem vazia" });

  const instructions = [
    "Você está operando dentro do Agency OS, uma agência de IA em formato de escritório 2D.",
    `Seu nome é ${agent}. Seu cargo é ${role}. Tarefa atual: ${task}. Cliente/contexto: ${clientId}.`,
    AGENT_RULES[agent] || "Atue estritamente dentro do seu papel profissional e das políticas do Agency OS.",
    "Handoff é prioridade: quando outro agente for claramente mais adequado, faça handoff em vez de fingir especialidade.",
    "Ações externas não devem ser alegadas como executadas sem ferramenta/evidência real.",
    "READ e DRAFT podem avançar; WRITE/PUBLISH/SPEND/DELETE devem respeitar aprovação.",
    "Responda em português do Brasil, direto, profissional e natural.",
    "Retorne SOMENTE JSON válido neste formato:",
    '{"reply":"resposta ao usuário","handoff":null,"status":"working","task_update":"resumo curto"}',
    'ou, se precisar delegar: {"reply":"resposta ao usuário","handoff":{"to":"NomeDoAgente","reason":"motivo","message":"contexto para o próximo agente"},"status":"handoff","task_update":"resumo curto"}'
  ].join("\n");

  const transcript = history.map(m => {
    const who = m.type === "user" ? "Hianto" : (m.agent || agent);
    return `${who}: ${String(m.text || "").slice(0,3000)}`;
  }).join("\n");

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${gatewayKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions,
        input: `Histórico recente:\n${transcript || "(sem histórico)"}\n\nHianto: ${message}`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Falha no Vercel AI Gateway",
        type: data?.error?.type || "ai_gateway_error"
      });
    }

    const raw = extractText(data);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw || "Resposta vazia.", handoff: null, status: "working", task_update: task };
    }

    return res.status(200).json({
      provider: "vercel-ai-gateway",
      agent,
      model,
      reply: String(parsed.reply || raw || ""),
      handoff: parsed.handoff || null,
      status: parsed.status || "working",
      task_update: parsed.task_update || task,
      response_id: data?.id || null
    });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
}