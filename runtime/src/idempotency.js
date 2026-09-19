export class IdempotencyStore{constructor(){this.keys=new Map()}has(key){return this.keys.has(key)}record(key,value){if(this.keys.has(key))return {duplicate:true,value:this.keys.get(key)};this.keys.set(key,value);return {duplicate:false,value}}}
export function operationKey({client_id,task_id,capability,input_hash=""}){return [client_id,task_id,capability,input_hash].join(":")}
