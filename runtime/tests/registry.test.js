import test from "node:test";import assert from "node:assert/strict";import {ConnectorRegistry} from "../src/registry.js";import {healthcheck} from "../src/health.js";
test("registry exposes connector",()=>{const r=new ConnectorRegistry().register({family:"crm"});assert.equal(r.has("crm"),true)});
test("health reports connector",async()=>{const r=new ConnectorRegistry().register({family:"social",healthcheck:async()=>({status:"ok"})});const h=await healthcheck(r);assert.equal(h.social.status,"ok")});
