export const TILE_W=64,TILE_H=32,GRID_W=24,GRID_H=18,ORIGIN_X=760,ORIGIN_Y=110;

export const ZONES=[
{id:"strategy",name:"ESTRATÉGIA",x:1,y:1,w:7,h:5,color:0x243956},
{id:"orion",name:"DIREÇÃO · ORION",x:9,y:1,w:6,h:5,color:0x2b3355},
{id:"content",name:"CONTEÚDO & MARCA",x:16,y:1,w:7,h:5,color:0x3a2d50},
{id:"growth",name:"AQUISIÇÃO & GROWTH",x:1,y:7,w:7,h:5,color:0x24433d},
{id:"web",name:"WEB & WORDPRESS",x:9,y:7,w:6,h:5,color:0x234050},
{id:"sales",name:"VENDAS & CRM",x:16,y:7,w:7,h:5,color:0x4a3a25},
{id:"ai",name:"IA & AUTOMAÇÃO",x:1,y:13,w:7,h:4,color:0x2f3559},
{id:"qa",name:"QA & GOVERNANÇA",x:9,y:13,w:6,h:4,color:0x4a2f46},
{id:"infra",name:"VPS & INFRA",x:16,y:13,w:7,h:4,color:0x33412d}
];

const raw=[
["Orion","Chief Orchestrator","orion","Coordena Jobs, decisões e handoffs",12,3,"working"],
["Maya","Strategy & Intelligence Lead","strategy","Estratégia e posicionamento",2,2,"working"],
["Iris","Market Researcher","strategy","Pesquisa mercado e concorrentes",4,2,"working"],
["Sofia","Persona & ICP Researcher","strategy","ICP, JTBD e objeções",6,2,"waiting"],
["Victor","Offer Strategist","strategy","Oferta e proposta de valor",3,4,"waiting"],
["Theo","Account Strategist","strategy","Plano de conta e KPIs",5,4,"working"],
["Luna","Content & Brand Lead","content","Coordena conteúdo e marca",17,2,"working"],
["Nina","Social Media Operator","content","Calendário e operação social",19,2,"working"],
["Leo","Copywriter","content","Copy, hooks e scripts",21,2,"working"],
["Cora","Content Strategist","content","Pilares e distribuição",17,4,"working"],
["Ravi","Creative Strategist","content","Ângulos e direção criativa",19,4,"waiting"],
["Mia","Creative Producer","content","Produção de criativos",21,4,"waiting"],
["Atlas","Acquisition & Growth Lead","growth","Aquisição mensurável",2,8,"working"],
["Max","Paid Traffic Operator","growth","Mídia paga e campanhas",4,8,"blocked"],
["Hugo","SEO Operator","growth","SEO técnico e orgânico",6,8,"working"],
["Gaia","Local SEO & Google Business","growth","Presença local e Google Business",3,10,"working"],
["Eva","GEO & AEO Operator","growth","Busca generativa e resposta",5,10,"waiting"],
["Noah","Web & Conversion Lead","web","Sites e conversão",10,8,"working"],
["Ian","Website Builder","web","Construção de sites",12,8,"waiting"],
["Lia","Landing Page Builder","web","Landing pages",14,8,"waiting"],
["Wally","WordPress Solutions Architect","web","Arquitetura WordPress",10,10,"working"],
["Piper","WordPress Plugin Engineer","web","Plugins e backoffice",12,10,"waiting"],
["Chloe","CRO Specialist","web","Otimização de conversão",14,10,"waiting"],
["Clara","Sales & CRM Lead","sales","Pipeline, vendas e CRM",17,8,"working"],
["Alex","Lead Researcher","sales","Pesquisa e enriquecimento",19,8,"waiting"],
["Sam","SDR & Outreach Operator","sales","Outreach e qualificação",21,8,"blocked"],
["Marco","Sales Agent","sales","Vendas e objeções",17,10,"waiting"],
["Emma","CRM Operator","sales","Higiene do pipeline",19,10,"working"],
["Jade","Follow-up Agent","sales","Follow-up contextual",21,10,"waiting"],
["Ada","AI & Automation Lead","ai","Agentes e automações",2,14,"working"],
["Turing","AI Agent Engineer","ai","Engenharia de agentes",4,14,"waiting"],
["Grace","Automation Architect","ai","Workflows e automações",6,14,"working"],
["Linus","Integration Engineer","ai","APIs e adapters",3,16,"waiting"],
["Nova","Context Engineer","ai","Contexto e memória",5,16,"working"],
["Vera","Quality & Governance Lead","qa","QA, governança e performance",10,14,"working"],
["Quinn","Marketing QA","qa","Verifica entregáveis",12,14,"working"],
["Hope","Approval & Risk Controller","qa","Approval Gate e risco",14,14,"working"],
["Finn","Performance Auditor","qa","Audita performance e evidência",12,16,"waiting"],
["Bruno","VPS & Infrastructure Lead","infra","VPS, Linux e infraestrutura",17,14,"working"],
["Nix","Linux Systems Operator","infra","Linux, systemd e filesystem",19,14,"waiting"],
["Dock","Docker & Container Operator","infra","Docker e containers",21,14,"waiting"],
["Sentinel","Security & Hardening","infra","Hardening e acesso",17,16,"working"],
["Vault","Backup & Disaster Recovery","infra","Backup e restore",19,16,"waiting"],
["Pulse","Monitoring & Reliability","infra","Logs, métricas e alertas",21,16,"working"]
];
export const AGENTS=raw.map(a=>({name:a[0],role:a[1],dept:a[2],task:a[3],gx:a[4],gy:a[5],status:a[6]}));
AGENTS.push(
{name:"Cesar",role:"FinOps & Infrastructure Pricing",dept:"infra",task:"Custos e cotações de infraestrutura",gx:22,gy:16,status:"waiting"},
{name:"Tenant",role:"Multi-Tenant Infrastructure Architect",dept:"infra",task:"Isolamento e provisionamento multi-tenant",gx:22,gy:14,status:"waiting"}
);

export function zoneFor(gx,gy){return ZONES.find(z=>gx>=z.x&&gx<z.x+z.w&&gy>=z.y&&gy<z.y+z.h);}
export function isoTop(gx,gy){return{x:ORIGIN_X+(gx-gy)*(TILE_W/2),y:ORIGIN_Y+(gx+gy)*(TILE_H/2)};}
export function tileCenter(gx,gy){const p=isoTop(gx,gy);return{x:p.x,y:p.y+TILE_H/2};}
export function worldToGrid(x,y){const dx=x-ORIGIN_X,dy=y-ORIGIN_Y-TILE_H/2,a=dx/(TILE_W/2),b=dy/(TILE_H/2);return{gx:Math.round((a+b)/2),gy:Math.round((b-a)/2)};}
export const keyOf=(x,y)=>x+","+y;
export const inside=(x,y)=>x>=0&&x<GRID_W&&y>=0&&y<GRID_H;
