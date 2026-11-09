# iria

Iria, Fran's personal [Pi](https://pi.dev) agent (formerly pifran). It is the same idea as Gentle Shell, but small and personal:

- **Engine:** a pinned `@earendil-works/pi-coding-agent`, installed as a dependency.
- **Package:** this repository is a Pi package (`package.json` → `pi`), so `extensions/`, `themes/`, `prompts/` and `skills/` load on every run.
- **Launcher:** `bin/iria.mjs` sets `PI_CODING_AGENT_DIR` to an isolated home (`~/.iria/agent`), so credentials, sessions and settings never mix with Gentle Shell or another Pi.

## Install

Install into a dedicated prefix. A plain `npm i -g` would also work, but a separate prefix keeps the bundled `pi` out of your `PATH`.

```sh
npm i -g --prefix ~/.local/share/iria github:FullFran/iria
ln -s ~/.local/share/iria/bin/iria ~/.local/bin/iria
```

From a local checkout, add `--install-links` and pass the path instead of `github:…`.

### Orca

Orca launches each agent by its command name. `iria` uses the OMP row:

```sh
ln -s ~/.local/share/iria/bin/iria ~/.local/bin/omp
```

When Orca provides `ORCA_OMP_STATUS_EXTENSION`, iria loads it so the Orca sidebar shows the agent state.

## Usage

```sh
iria                      # interactive session
iria -p "summarize this"  # print mode
iria install npm:pkg      # Pi subcommands run inside the iria home
```

| Variable | Effect |
|---|---|
| `IRIA_HOME` | Overrides the home directory (default `~/.iria/agent`). |
| `PIFRAN_HOME` | Old name of `IRIA_HOME`, still honoured when `IRIA_HOME` is unset. |

## Migrating from pifran

The package also installs a `pifran` command that runs the same launcher. While `~/.iria/agent` does not exist, iria keeps using an existing `~/.pifran/agent` and prints a warning. Move it once to finish:

```sh
mv ~/.pifran ~/.iria
```

## Notion

`extensions/notion.ts` connects the official Notion MCP server (`https://mcp.notion.com/mcp`) with `deferred` exposure. Sign in once from a session with `/mcp login notion`.

## Customize

Add files and reinstall:

- `extensions/*.ts`: Pi extensions (see Pi's `docs/extensions.md`).
- `themes/*.json`: themes; select one with `/settings` or `--use-theme`.
- `prompts/*.md`: prompt templates.
- `skills/<name>/SKILL.md`: skills.

Pi itself is pinned in `package.json`. Bump the version there to upgrade it.
