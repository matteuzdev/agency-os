# Agency OS Office

Interface 2D experimental para viver a operação da agência.

## Objetivo
Mostrar agentes, departamentos, tarefas, status, logs e conversas sem perder o contexto operacional do Agency OS.

## Rodar
Abra `office/index.html` no navegador, ou sirva a pasta com qualquer servidor estático.

Exemplo:
```bash
npx serve office
```

## Handoff é prioridade
A interface NÃO finge que o navegador virou um LLM. Quando Hianto conversa com um agente:
1. a mensagem fica persistida no navegador;
2. o Office monta um `Handoff Envelope`;
3. o pacote preserva cliente, Job, agente, tarefa, histórico e política de aprovação;
4. o handoff pode ser enviado ao Orion localmente ou copiado para o ChatGPT;
5. o runtime/ChatGPT continua o trabalho como o agente correto.

## Próxima integração
Trocar o handoff manual por um endpoint autenticado do Agency OS runtime, para que mensagens do Office cheguem ao Orion e retornem ao painel em tempo real.
