import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { mergeDefaults, seedSettings } from "../lib/settings.mjs";

test("fills missing scalar keys without overriding user choices", () => {
	const { settings, changed } = mergeDefaults({ theme: "dark" }, { theme: "TokyoNight-Fran", quietStartup: true });
	assert.deepEqual(settings, { theme: "dark", quietStartup: true });
	assert.equal(changed, true);
});

test("appends missing array entries and keeps the user's order and extras", () => {
	const { settings } = mergeDefaults({ packages: ["npm:mine", "npm:pi-btw"] }, { packages: ["npm:gentle-engram", "npm:pi-btw"] });
	assert.deepEqual(settings.packages, ["npm:mine", "npm:pi-btw", "npm:gentle-engram"]);
});

test("reports no change when every default is already present", () => {
	const { changed } = mergeDefaults({ theme: "x", packages: ["a"] }, { theme: "y", packages: ["a"] });
	assert.equal(changed, false);
});

test("seedSettings creates settings.json and leaves a valid file untouched on rerun", () => {
	const dir = mkdtempSync(join(tmpdir(), "iria-"));
	try {
		const defaults = join(dir, "defaults.json");
		writeFileSync(defaults, JSON.stringify({ quietStartup: true }));
		seedSettings(join(dir, "home"), defaults);
		const file = join(dir, "home", "settings.json");
		assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), { quietStartup: true });
		writeFileSync(file, JSON.stringify({ quietStartup: false, deviceId: "d" }));
		seedSettings(join(dir, "home"), defaults);
		assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), { quietStartup: false, deviceId: "d" });
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("seedSettings never rewrites a settings.json it cannot parse", () => {
	const dir = mkdtempSync(join(tmpdir(), "iria-"));
	try {
		const defaults = join(dir, "defaults.json");
		writeFileSync(defaults, JSON.stringify({ quietStartup: true }));
		const file = join(dir, "settings.json");
		writeFileSync(file, "{ broken");
		seedSettings(dir, defaults);
		assert.equal(readFileSync(file, "utf8"), "{ broken");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
