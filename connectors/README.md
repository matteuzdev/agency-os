# Connector Layer

Agentes chamam capacidades, não APIs específicas.

## Famílias
- social: publish, schedule, comments, replies, metrics
- ads: campaigns, creatives, audiences, budgets, metrics
- local-business: profile, posts, reviews, insights
- search: keyword/serp/search-console capabilities
- analytics: events, conversions, attribution
- crm: contacts, pipeline, activities
- messaging: conversations, send, templates
- email: campaigns, sequences, metrics
- cms: pages, posts, assets
- deployment: build, preview, deploy, rollback
- storage: files/assets
- automation: workflows, webhooks, jobs
- browser/computer-use: UI execution fallback

## Routing
Agent → Tool Router → Capability → Connector → Provider Adapter.

Prioridade: API oficial/connector estruturado. Browser/Computer Use é fallback quando necessário e autorizado.
