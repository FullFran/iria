// Resolves the Pi home iria runs with. iria was called pifran before, so an
// existing ~/.pifran/agent (tokens, sessions, settings) keeps working until it
// is moved by hand to ~/.iria/agent; `legacy` tells the launcher to say so.
import { join } from "node:path";

export function resolveHome(env, homedir, exists) {
	if (env.IRIA_HOME) return { home: env.IRIA_HOME, legacy: false };
	if (env.PIFRAN_HOME) return { home: env.PIFRAN_HOME, legacy: true };
	const home = join(homedir, ".iria", "agent");
	const old = join(homedir, ".pifran", "agent");
	if (!exists(home) && exists(old)) return { home: old, legacy: true };
	return { home, legacy: false };
}
