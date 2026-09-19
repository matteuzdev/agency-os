# Agency OS Office Game

Escritório 2D jogável do Agency OS.

## O que existe agora
- personagem do Hianto controlável por WASD/setas;
- departamentos físicos e mesas;
- agentes/NPCs no escritório;
- aproximação + tecla E para conversar;
- chat real via OpenAI API;
- logs de operação;
- handoff automático entre agentes;
- Orion recebe registro dos handoffs;
- configuração de modelo e chave de API;
- histórico local de conversas, sem salvar a API key no localStorage.

## Rodar localmente
Sirva a pasta `office` com um servidor HTTP. O HTML sozinho funciona para o mapa, mas o chat de IA precisa do endpoint `/api/chat`.

Com Vercel, use `office` como Root Directory.

## IA na Vercel — recomendado
Em Vercel → Project Settings → Environment Variables:

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-luna
```

O modelo também pode ser escolhido na interface.

## Chave temporária pela interface
O botão `⚙ IA` abre a configuração. A chave digitada ali fica apenas na memória da aba e é enviada ao endpoint da própria aplicação. Ao recarregar a página, ela some.

Para produção, prefira `OPENAI_API_KEY` na Vercel.

## Handoff
Quando um agente decide que outro especialista é mais adequado, a resposta pode gerar:

```json
{
  "handoff": {
    "to": "NomeDoAgente",
    "reason": "motivo",
    "message": "contexto transferido"
  }
}
```

O Office entrega o contexto ao agente de destino e registra a transferência para Orion.

## Limite atual
Os agentes já conversam por IA de verdade, mas ainda não possuem todas as ferramentas externas do runtime conectadas dentro do Office. A próxima camada é ligar chat → Job/Task → connectors → receipts/evidência.
