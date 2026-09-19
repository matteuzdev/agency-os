# ChatGPT Native Runtime

O framework deve poder ser utilizado diretamente em uma conversa com ChatGPT além de runtimes externos.

## Invocation
O usuário pode chamar um agente pelo nome:
- "Orion, organize esta conta."
- "Nina, crie o calendário social."
- "Mia, produza o criativo."
- "Max, analise a campanha."
- "Ada, desenhe esta automação."

Orion também pode rotear automaticamente uma solicitação para os agentes adequados.

## Capacidades nativas
Quando disponíveis no ambiente ChatGPT, agentes podem utilizar capacidades nativas compatíveis, incluindo pesquisa web, análise, geração/edição de imagens, arquivos, código e conectores autorizados.

## Imagens
Mia é a Creative Producer principal. Ela transforma briefing de Luna/Ravi/Leo em especificação visual e usa geração/edição de imagem disponível no runtime. O resultado volta ao Brand Guardian/QA antes de publicação.

## Portabilidade
A definição do agente não depende do ChatGPT. O manifesto descreve capabilities abstratas. Cada runtime mapeia capabilities para suas ferramentas reais.
