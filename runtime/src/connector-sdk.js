export function defineConnector({id,family,actions}){if(!id||!family||!actions)throw new Error("id, family and actions required");return {id,family,...actions}}
export function blockedConnector(family,reason="Connection not configured"){return new Proxy({family},{get(target,key){if(key in target)return target[key];return async()=>{const e=new Error(reason);e.code="BLOCKED_CONNECTION";throw e}}})}
