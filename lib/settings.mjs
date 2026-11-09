// Seeds iria's defaults into the Pi home settings.json. Pi rewrites that file
// itself (model choice, device id, changelog marker), so it is merged instead
// of replaced, and a value the user already set always wins.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Scalars are filled only when missing. Arrays (packages, skill filters) gain
// the missing default entries, appended after the user's own.
export function mergeDefaults(current, defaults) {
	const settings = { ...current };
	let changed = false;
	for (const [key, value] of Object.entries(defaults)) {
		if (Array.isArray(value)) {
			const existing = Array.isArray(settings[key]) ? settings[key] : [];
			const missing = value.filter((entry) => !existing.some((item) => JSON.stringify(item) === JSON.stringify(entry)));
			if (missing.length > 0 || !Array.isArray(settings[key])) {
				settings[key] = [...existing, ...missing];
				changed = true;
			}
		} else if (settings[key] === undefined) {
			settings[key] = value;
			changed = true;
		}
	}
	return { settings, changed };
}

export function seedSettings(home, defaultsPath) {
	const file = join(home, "settings.json");
	const defaults = JSON.parse(readFileSync(defaultsPath, "utf8"));
	let current = {};
	if (existsSync(file)) {
		try {
			current = JSON.parse(readFileSync(file, "utf8"));
		} catch {
			// A file Pi or the user is mid-way through editing must not be lost.
			console.error(`iria: ${file} is not valid JSON; defaults not applied.`);
			return;
		}
	}
	const { settings, changed } = mergeDefaults(current, defaults);
	if (!changed) return;
	mkdirSync(home, { recursive: true });
	const tmp = `${file}.iria-tmp`;
	writeFileSync(tmp, `${JSON.stringify(settings, null, 2)}\n`, { mode: 0o600 });
	renameSync(tmp, file);
}
