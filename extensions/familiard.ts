// Reports iria activity to familiard, so a desktop pet follows the session.
// Does nothing when familiard is not installed.
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { delimiter, join } from "node:path"

const AGENT = "iria"

// familiard on PATH first, then the copy iria-desktop installs.
function findFamiliard(): string | undefined {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (!dir) continue
    const candidate = join(dir, "familiard")
    if (existsSync(candidate)) return candidate
  }
  const iria = join(homedir(), ".local/share/iria-desktop/familiard")
  return existsSync(iria) ? iria : undefined
}

export default function (pi: any) {
  const bin = findFamiliard()
  if (!bin) return

  const send = (state: string, ctx: any) => {
    try {
      const session = ctx?.sessionManager?.getSessionFile?.() || ctx?.cwd || process.cwd()
      const child = spawn(bin, ["hook", "--agent", AGENT, "--event", state, "--session", session, "--project", ctx?.cwd || process.cwd()], {
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
