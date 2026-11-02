// Reports Gentle Shell (Pi) activity to the desktop pet (scripts/iria-desktop).
// Does nothing when the pet is not installed.
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const FAMILIARD_BIN = join(homedir(), ".local/share/iria-desktop/familiard")

export default function (pi: any) {
  const send = (state: string, ctx: any) => {
    if (!existsSync(FAMILIARD_BIN)) return
    try {
      const session = ctx?.sessionManager?.getSessionFile?.() || ctx?.cwd || process.cwd()
      const child = spawn(FAMILIARD_BIN, ["hook", "--agent", "pi", "--event", state, "--session", session, "--project", ctx?.cwd || process.cwd()], {
        stdio: "ignore",
        detached: true,
      })
      child.on("error", () => {})
      child.unref()
    } catch {}
  }
  pi.on("session_start", async (_event: any, ctx: any) => send("registered", ctx))
  pi.on("agent_start", async (_event: any, ctx: any) => send("working", ctx))
  pi.on("agent_end", async (_event: any, ctx: any) => send("done", ctx))
  pi.on("session_shutdown", async (_event: any, ctx: any) => send("ended", ctx))
}
