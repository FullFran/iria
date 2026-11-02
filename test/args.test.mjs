import assert from "node:assert/strict";
import { test } from "node:test";
import { buildArgs } from "../lib/args.mjs";

const ROOT = "/pkg";
const ORCA_ARGV = [
	"--extension",
	"/home/u/.omp/agent/extensions/orca-agent-status.ts",
	"--config",
	"/home/u/.config/orca/omp-managed-status-extension/fresh-session.yml",
	"/triaje",
];

test("drops omp-only --config and its value, keeps the rest in order", () => {
	assert.deepEqual(buildArgs(ORCA_ARGV, { root: ROOT }), [
		"-e",
		ROOT,
		"--extension",
		"/home/u/.omp/agent/extensions/orca-agent-status.ts",
		"/triaje",
	]);
});

test("drops the --config=value form too", () => {
	assert.deepEqual(buildArgs(["--config=/x.yml", "hola"], { root: ROOT }), ["-e", ROOT, "hola"]);
});

test("adds the Orca status extension from the environment only when argv lacks one", () => {
	assert.deepEqual(buildArgs(["hola"], { root: ROOT, orcaStatus: "/s/orca-agent-status.ts" }), [
		"-e",
		ROOT,
		"-e",
		"/s/orca-agent-status.ts",
		"hola",
	]);
	assert.deepEqual(buildArgs(ORCA_ARGV, { root: ROOT, orcaStatus: "/s/orca-agent-status.ts" }).filter((a) => a.endsWith("orca-agent-status.ts")).length, 1);
});

test("passes Pi subcommands through untouched", () => {
	assert.deepEqual(buildArgs(["install", "npm:x"], { root: ROOT, orcaStatus: "/s/orca-agent-status.ts" }), ["install", "npm:x"]);
});

test("keeps a --config that appears after the -- separator as a literal argument", () => {
	assert.deepEqual(buildArgs(["--", "--config"], { root: ROOT }), ["-e", ROOT, "--", "--config"]);
});
