# Runtime

Kai recebe um objetivo e cria um Job.
Cada Job contém client_context, objective, constraints, KPI, budget/risk policy e deadline.

O planner decompõe o Job em Tasks. O router seleciona líder/especialista por capability. O executor carrega persona + contexto + skills + ferramentas. O verifier testa o resultado. O approval gate intercepta ações sensíveis. O action layer executa via connector. O observer registra evidências e métricas. O memory layer persiste aprendizados relevantes.

Estados:
QUEUED → PLANNED → DELEGATED → RUNNING → VERIFYING → APPROVAL → EXECUTING → MEASURING → DONE/FAILED/ESCALATED.
