# Living Office — Handoff Protocol

O escritório não é apenas visualização. Ele é uma superfície de interação com o Agency OS.

## Objetivo
Permitir que o usuário "entre na mesa" de qualquer agente, converse diretamente e mantenha contexto quando o trabalho for transferido.

## Conversation
Cada mensagem deve gerar:
- conversation_id
- client_id opcional
- sender
- recipient_agent
- message
- timestamp
- context_refs
- job_id opcional

## Handoff
Handoff = transferência explícita de trabalho/contexto entre agentes.

Payload mínimo:
- from_agent
- to_agent
- reason
- objective
- context_summary
- artifacts
- decisions
- pending_questions
- approval_state

Regra: o agente receptor não começa do zero. Recebe resumo, decisões, artefatos e pendências.

## Modos
DIRECT: usuário fala diretamente com especialista.
ORCHESTRATED: Orion escolhe/delega.
HANDOFF: especialista transfere para outro especialista.
ROOM: vários agentes colaboram no mesmo Job.

## ChatGPT bridge
Enquanto não houver um backend/model gateway próprio, a conversa real pode acontecer no ChatGPT usando o mesmo protocolo:
- "Orion, ..."
- "Bruno, ..."
- "Wally, ..."
- "Passe isso para Mia."
- "Chame Ada e Linus para essa tarefa."

O Living Office registra/visualiza; o runtime deve futuramente receber as mensagens por API/webhook e produzir eventos de volta para a interface.

## Event stream
Eventos previstos:
AGENT_STARTED
AGENT_THINKING
TASK_CREATED
TASK_UPDATED
HANDOFF_REQUESTED
HANDOFF_ACCEPTED
ARTIFACT_CREATED
APPROVAL_REQUIRED
ACTION_EXECUTED
ACTION_FAILED
AGENT_IDLE
MESSAGE_RECEIVED
MESSAGE_SENT
