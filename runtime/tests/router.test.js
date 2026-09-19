import test from "node:test";import assert from "node:assert/strict";import {routeCapability,buildPlan} from "../src/router.js";
test("routes wordpress to Wally",()=>assert.equal(routeCapability("wordpress.plugin_deploy"),"Wally"));
test("routes vps to Bruno",()=>assert.equal(routeCapability("vps.inspect"),"Bruno"));
test("unknown routes to Orion",()=>assert.equal(routeCapability("unknown.x"),"Orion"));
test("plan creates dependencies",()=>{const p=buildPlan("x",["strategy.research","website.build"]);assert.deepEqual(p[1].depends_on,["task_1"])});
