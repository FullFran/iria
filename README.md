# pifran

Fran's personal [Pi](https://pi.dev) coding agent. It is the same idea as Gentle Shell, but small and personal:

- **Engine:** a pinned `@earendil-works/pi-coding-agent`, installed as a dependency.
- **Package:** this repository is a Pi package (`package.json` → `pi`), so `extensions/`, `themes/`, `prompts/` and `skills/` load on every run.
- **Launcher:** `bin/pifran.mjs` sets `PI_CODING_AGENT_DIR` to an isolated home (`~/.pifran/agent`), so credentials, sessions and settings never mix with Gentle Shell or another Pi.

## Install

Install into a dedicated prefix. A plain `npm i -g` would also work, but a separate prefix keeps the bundled `pi` out of your `PATH`.

```sh
npm i -g --prefix ~/.local/share/pifran github:FullFran/pifran
ln -s ~/.local/share/pifran/bin/pifran ~/.local/bin/pifran
```

From a local checkout, add `--install-links` and pass the path instead of `github:…`.

### Orca

Orca launches each agent by its command name. `pifran` uses the OMP row:

```sh
ln -s ~/.local/share/pifran/bin/pifran ~/.local/bin/omp
```

When Orca provides `ORCA_OMP_STATUS_EXTENSION`, pifran loads it so the Orca sidebar shows the agent state.

## Usage

```sh
pifran                      # interactive session
pifran -p "summarize this"  # print mode
pifran install npm:pkg      # Pi subcommands run inside the pifran home
```

| Variable | Effect |
|---|---|
| `PIFRAN_HOME` | Overrides the home directory (default `~/.pifran/agent`). |

## Customize

Add files and reinstall:

- `extensions/*.ts`: Pi extensions (see Pi's `docs/extensions.md`).
- `themes/*.json`: themes; select one with `/settings` or `--use-theme`.
- `prompts/*.md`: prompt templates.
- `skills/<name>/SKILL.md`: skills.

Pi itself is pinned in `package.json`. Bump the version there to upgrade it.
