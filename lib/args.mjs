// Builds the argv iria hands to Pi.
//
// Orca launches iria from its OMP row as if it were the real omp
// (oh-my-pi), so it passes options Pi does not know. Those are dropped here.

// Pi subcommands that manage state instead of opening a session. They must not
// receive `-e`, or the package would be passed as an argument to the command.
const PI_SUBCOMMANDS = new Set(["install", "remove", "uninstall", "update", "list", "config", "auth", "mcp"]);

// omp-only options that take a value. Orca sends `--config <fresh-session.yml>`
// to start a fresh omp session; Pi rejects it with "Unknown option: --config".
const OMP_ONLY_WITH_VALUE = new Set(["--config"]);

const ORCA_STATUS_FILE = "orca-agent-status.ts";

function dropOmpOnly(args) {
	const kept = [];
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--") {
			kept.push(...args.slice(i));
			break;
		}
		if (OMP_ONLY_WITH_VALUE.has(arg)) {
			i++;
			continue;
		}
		if ([...OMP_ONLY_WITH_VALUE].some((name) => arg.startsWith(`${name}=`))) continue;
		kept.push(arg);
	}
	return kept;
}

export function buildArgs(userArgs, { root, orcaStatus } = {}) {
	if (PI_SUBCOMMANDS.has(userArgs[0])) return userArgs;
	const args = dropOmpOnly(userArgs);
	const prefix = ["-e", root];
	// Orca either passes its status extension explicitly or only through
	// ORCA_OMP_STATUS_EXTENSION. Load it once.
	const hasOrcaStatus = args.some((arg) => arg.endsWith(ORCA_STATUS_FILE));
	if (orcaStatus && !hasOrcaStatus) prefix.push("-e", orcaStatus);
	return [...prefix, ...args];
}
