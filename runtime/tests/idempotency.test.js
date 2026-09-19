import test from "node:test";import assert from "node:assert/strict";import {IdempotencyStore} from "../src/idempotency.js";
test("duplicate operation is detected",()=>{const s=new IdempotencyStore();assert.equal(s.record("x",1).duplicate,false);assert.equal(s.record("x",2).duplicate,true)});
