# Agency OS Runtime v0.1

Primeiro runtime executável do framework.

## O que já executa
- criação de Job e Task;
- roteamento por capability `familia.acao`;
- bloqueio quando não há connector;
- Approval Gate por nível de risco;
- execução de connector;
- Execution Receipt/evidência;
- testes unitários sem dependências externas.

## Rodar
`npm test`
`npm run demo`

Adapters reais entram pelo Connector SDK sem colocar credenciais nos manifests dos agentes.
