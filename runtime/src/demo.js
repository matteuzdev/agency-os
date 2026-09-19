import {createJob,createTask,executeTask,RISK} from "./engine.js";
import {defineConnector} from "./connector-sdk.js";
const social=defineConnector({id:"demo-social",family:"social",actions:{create_draft:async input=>({draft:input,evidence:"demo://draft/1"})}});
const job=createJob({clientId:"demo",objective:"Criar rascunho social"});
const task=createTask(job,{id:"t1",agent:"Nina",capability:"social.create_draft",risk:RISK.DRAFT,input:{text:"Olá"}});
console.log(await executeTask({job,task,connectors:{social}}));
