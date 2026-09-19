# Living Office — Game Design Notes

## Direção

O Office deve se comportar como um jogo social de salas isométricas, inspirado na sensação de ambientes como Habbo, mas sem copiar assets, mapas, personagens ou identidade proprietária.

Princípios:
- jogador existe dentro do espaço;
- o espaço comunica a estrutura da empresa;
- agentes são NPCs operacionais;
- aproximação e movimento fazem parte da interação;
- trabalho, handoffs e conversas aparecem visualmente no mundo;
- UI lateral complementa o jogo, não substitui o jogo.

## Base técnica

A implementação usa Phaser 3 e segue a lógica recomendada pela skill pública Game Studio: jogo 2D como sistema vivo, com entidades, estado, input, cenas e playtest.

Phaser suporta orientação isométrica em seu sistema de Tilemaps; esta primeira versão usa uma grade isométrica própria sobre Phaser para manter o Office sem dependência de tiles proprietários.

## Mecânicas v0.2

- clique para andar;
- WASD/setas;
- pathfinding A* em grade;
- móveis bloqueiam posições;
- NPCs/agentes têm estação de trabalho;
- E abre conversa por proximidade;
- respostas aparecem em balões no mapa;
- handoff aparece como conexão visual entre agentes;
- status working/waiting/blocked existe no personagem;
- câmera acompanha Hianto.

## Inteligência

Gateway selecionável:
- OpenRouter;
- Vercel AI Gateway.

OpenRouter:
- variável: OPENROUTER_API_KEY;
- catálogo remoto em /api/models;
- modelo default: openrouter/auto.

Vercel:
- variável: AI_GATEWAY_API_KEY;
- modelo default: openai/gpt-5.4.

## Próximo nível visual

- spritesheets próprios;
- animação 4/8 direções;
- sentar em cadeiras;
- agentes andando até outros agentes durante handoffs;
- elevador e vários andares;
- recepção, sala de reunião, coffee room;
- personalização do avatar de Hianto;
- indicadores reais de Job/Task acima das mesas.
