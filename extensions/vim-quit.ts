/**
 * Quit with vim-style commands (:q, :q!, :qa, :wq, :x) instead of sending them to the model.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const QUIT_COMMANDS = new Set([":q", ":q!", ":qa", ":qa!", ":wq", ":x"]);

export default function (pi: ExtensionAPI) {
	pi.on("input", async (event, ctx) => {
		if (event.source !== "interactive") return { action: "continue" };
		if (!QUIT_COMMANDS.has(event.text.trim())) return { action: "continue" };
		ctx.shutdown();
		return { action: "handled" };
	});
}
