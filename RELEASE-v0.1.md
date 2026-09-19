# Agency OS v0.1 — Framework Release Candidate

Status: RELEASE CANDIDATE

A especificação arquitetural está fechada e existe um runtime mínimo executável para Jobs, Tasks, Approval Gate, Connectors e Execution Receipts.

## Produção
Ainda exigem configuração externa:
- OAuth/API credentials de cada cliente/provedor;
- adapters reais para os provedores escolhidos;
- infraestrutura onde o runtime será hospedado;
- piloto controlado antes de autonomia em produção.

## Regra de verdade
Sem connector autorizado/configurado, a execução deve retornar BLOCKED_CONNECTION. Nunca declarar ação externa sem receipt/evidência.

## Próximo marco
v0.1 production pilot: conectar um cliente controlado, executar onboarding, WordPress/VPS ou marketing, medir e corrigir o runtime.
