#!/usr/bin/env node
// pifran launcher: runs the bundled Pi with an isolated home and loads this
// repository as a Pi package, the same shape Gentle Shell uses for gentle-pi.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PI_PACKAGE = "@earendil-works/pi-coding-agent";

// Pi subcommands that manage state instead of opening a session. They must not
// receive `-e`, or the package would be passed as an argument to the command.
const PI_SUBCOMMANDS = new Set(["install", "remove", "uninstall", "update", "list", "config", "auth", "mcp"]);

function resolvePiCli() {
	const require = createRequire(join(PACKAGE_ROOT, "package.json"));
	let manifestPath;
	try {
		manifestPath = require.resolve(`${PI_PACKAGE}/package.json`);
	} catch {
		manifestPath = join(PACKAGE_ROOT, "node_modules", PI_PACKAGE, "package.json");
	}
	if (!existsSync(manifestPath)) {
		throw new Error(`pifran: ${PI_PACKAGE} is not installed next to ${PACKAGE_ROOT}`);
	}
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.pi;
	if (!bin) throw new Error(`pifran: ${PI_PACKAGE} does not declare a pi binary`);
	return join(dirname(manifestPath), bin);
}

function buildArgs(userArgs) {
	if (PI_SUBCOMMANDS.has(userArgs[0])) return userArgs;
	const args = ["-e", PACKAGE_ROOT];
	// Orca launches this binary from its OMP row and hands over a status
	// extension so its sidebar can show the agent state.
	const orcaStatus = process.env.ORCA_OMP_STATUS_EXTENSION;
	if (orcaStatus && existsSync(orcaStatus)) args.push("-e", orcaStatus);
	return [...args, ...userArgs];
}

function main() {
	const home = process.env.PIFRAN_HOME || join(homedir(), ".pifran", "agent");
	mkdirSync(home, { recursive: true });

	let cli;
	try {
		cli = resolvePiCli();
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}

	const child = spawn(process.execPath, [cli, ...buildArgs(process.argv.slice(2))], {
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
		console.error(`pifran: failed to start Pi: ${error.message}`);
		process.exit(1);
	});
	child.on("exit", (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 0);
	});
}

main();
