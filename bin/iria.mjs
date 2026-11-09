#!/usr/bin/env node
// iria launcher: runs the bundled Pi with an isolated home and loads this
// repository as a Pi package, the same shape Gentle Shell uses for gentle-pi.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildArgs } from "../lib/args.mjs";
import { resolveHome } from "../lib/home.mjs";
import { seedSettings } from "../lib/settings.mjs";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PI_PACKAGE = "@earendil-works/pi-coding-agent";

function resolvePiCli() {
	const require = createRequire(join(PACKAGE_ROOT, "package.json"));
	let manifestPath;
	try {
		manifestPath = require.resolve(`${PI_PACKAGE}/package.json`);
	} catch {
		manifestPath = join(PACKAGE_ROOT, "node_modules", PI_PACKAGE, "package.json");
	}
	if (!existsSync(manifestPath)) {
		throw new Error(`iria: ${PI_PACKAGE} is not installed next to ${PACKAGE_ROOT}`);
	}
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.pi;
	if (!bin) throw new Error(`iria: ${PI_PACKAGE} does not declare a pi binary`);
	return join(dirname(manifestPath), bin);
}

// Orca hands over its status extension so its sidebar can show the agent state.
function piArgs() {
	const orcaStatus = process.env.ORCA_OMP_STATUS_EXTENSION;
	return buildArgs(process.argv.slice(2), {
		root: PACKAGE_ROOT,
		orcaStatus: orcaStatus && existsSync(orcaStatus) ? orcaStatus : undefined,
	});
}

function main() {
	const { home, legacy } = resolveHome(process.env, homedir(), existsSync);
	if (legacy) {
		console.error(`iria: using the old pifran home ${home}; set IRIA_HOME or move it to ~/.iria/agent.`);
	}
	mkdirSync(home, { recursive: true });
	seedSettings(home, join(PACKAGE_ROOT, "defaults", "settings.json"));

	let cli;
	try {
		cli = resolvePiCli();
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}

	const child = spawn(process.execPath, [cli, ...piArgs()], {
		stdio: "inherit",
		env: { ...process.env, PI_CODING_AGENT_DIR: home },
	});

	// Ctrl+C already reaches Pi through the shared terminal process group;
	// forwarding it again would count as a second press and quit Pi.
	process.on("SIGINT", () => {});
	for (const signal of ["SIGTERM", "SIGHUP"]) {
		process.on(signal, () => child.kill(signal));
	}
	child.on("error", (error) => {
		console.error(`iria: failed to start Pi: ${error.message}`);
		process.exit(1);
	});
	child.on("exit", (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 0);
	});
}

main();
