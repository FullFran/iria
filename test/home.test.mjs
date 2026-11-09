import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveHome } from "../lib/home.mjs";

const HOME = "/home/someone";
const none = () => false;

test("IRIA_HOME wins over everything", () => {
	const env = { IRIA_HOME: "/custom", PIFRAN_HOME: "/old" };
	assert.deepEqual(resolveHome(env, HOME, () => true), { home: "/custom", legacy: false });
});

test("PIFRAN_HOME is still honoured when IRIA_HOME is unset", () => {
	assert.deepEqual(resolveHome({ PIFRAN_HOME: "/old" }, HOME, none), { home: "/old", legacy: true });
});

test("defaults to ~/.iria/agent", () => {
	assert.deepEqual(resolveHome({}, HOME, none), { home: `${HOME}/.iria/agent`, legacy: false });
});

test("keeps using ~/.pifran/agent while it exists and ~/.iria/agent does not", () => {
	const exists = (path) => path === `${HOME}/.pifran/agent`;
	assert.deepEqual(resolveHome({}, HOME, exists), { home: `${HOME}/.pifran/agent`, legacy: true });
});

test("prefers ~/.iria/agent once it exists", () => {
	assert.deepEqual(resolveHome({}, HOME, () => true), { home: `${HOME}/.iria/agent`, legacy: false });
});
