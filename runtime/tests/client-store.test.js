import test from "node:test";import assert from "node:assert/strict";import {ClientStore} from "../src/client-store.js";
test("client contexts remain isolated",()=>{const s=new ClientStore();s.put({client_id:"a",brand:{name:"A"}});s.put({client_id:"b",brand:{name:"B"}});s.get("a").brand.name="X";assert.equal(s.get("b").brand.name,"B")});
