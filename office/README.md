# Agency OS — Living Office

Escritório virtual isométrico e jogável do Agency OS.

## Experiência
- visão isométrica inspirada em jogos sociais de salas, sem copiar assets proprietários;
- Phaser 3 como runtime 2D;
- clique no chão para andar;
- WASD/setas para movimentação;
- pathfinding em grade;
- mesas, salas, divisórias e agentes/NPCs;
- aproxime-se e pressione E para conversar;
- balões de fala e handoffs desenhados dentro do mapa;
- logs operacionais e histórico por agente.

## Inteligência multi-provider

O Office não é preso à OpenAI.

### OpenRouter
Na Vercel:
```
OPENROUTER_API_KEY=...
```

No Office:
```
⚙ Inteligência
Gateway: OpenRouter
Modelo: openrouter/auto
```

O catálogo de modelos é carregado dinamicamente pelo endpoint `/api/models`.

### Vercel AI Gateway
Na Vercel:
```
AI_GATEWAY_API_KEY=...
```

No Office:
```
⚙ Inteligência
Gateway: Vercel AI Gateway
Modelo: openai/gpt-5.4
```

Você também pode digitar uma chave temporária na interface. Ela fica apenas na memória da aba e não é persistida no localStorage.

## Handoff-first
Quando um agente identifica outro especialista:
1. devolve um handoff estruturado;
2. o Office transfere o contexto ao agente de destino;
3. Orion recebe o registro;
4. o mapa mostra visualmente a transferência;
5. o histórico continua no agente correto.

## Estrutura do game
```
office/
├── index.html
├── game.css
├── game/
│   ├── main.js
│   ├── config.js
│   ├── state.js
│   ├── render.js
│   ├── scene.js
│   └── ui.js
└── api/
    ├── chat.js
    └── models.js
```

## Próximas camadas
- sprites/roupas e animações mais ricas;
- NPCs andando entre estações;
- elevador/andares;
- jobs reais refletidos no mapa;
- connectors executáveis com receipts;
- persistência server-side das conversas/jobs.
