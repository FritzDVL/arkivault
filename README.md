# Arkivault — On-Chain Second Brain

> Your Obsidian vault, owned by your wallet, encrypted by your key, stored on
> the Arkiv L3. No central server.

Arkivault is an Obsidian community plugin that syncs your markdown vault to the
[Arkiv](https://arkiv.network) L3 (Braga testnet) as encrypted Entities owned
by your Ethereum address. Every device reads and writes directly to Arkiv via
RPC — there is no API to host, no database to rent, no third party that can
read your notes.

Built for the [Network School (NS) × Arkiv](https://www.ethns.io/) hackathon.

---

## What's in this repo

This is a pnpm monorepo with multiple artifacts:

| Path                          | What it is                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `artifacts/obsidian-plugin/`  | The Obsidian community plugin — the headline deliverable                      |
| `artifacts/landing/`          | Marketing landing page (React + Vite + Tailwind)                              |
| `artifacts/api-server/`       | Minimal Express server scaffold (not required for the plugin to work)         |
| `artifacts/mockup-sandbox/`   | Internal Vite sandbox used during design iteration                            |

The plugin is fully self-contained: it talks directly to Arkiv over RPC and
does not need the API server.

---

## How it works

```
┌──────────────────┐                ┌───────────────────┐                ┌──────────────────┐
│  Obsidian Vault  │  ◄──RPC────►  │ ARKIV L3 (BRAGA)  │  ◄──RPC────►  │  Any other app   │
│  + this plugin   │                │  (the database)   │                │  with your key   │
└──────────────────┘                └───────────────────┘                └──────────────────┘
```

For each note:

1. The plugin encrypts the note locally with AES-256-GCM using a key derived
   from your private key (`SHA-256(privateKey)`).
2. The encrypted blob is written to Arkiv as an Entity owned by your wallet
   address, tagged with two plaintext attributes: `category` (configurable,
   default `obsidian-second-brain`) and `noteId` (`SHA-1(path)`).
3. On pull, the plugin queries Arkiv for every Entity in that category owned
   by your address, keeps the latest one per `noteId` (highest
   `createdAtBlock`), decrypts it, and writes the markdown back into your
   vault.

Because the payload is encrypted on your device before it ever touches the
chain, no Arkiv node operator — or anyone else querying the chain — can read
your notes. Only devices holding your private key can decrypt them.

**Trade-offs you should know about:**

- **Last-write-wins.** If you edit the same note on two devices before either
  syncs, one device's edits win and the other's are lost. CRDT-based merging
  is on the roadmap.
- **Private key on disk.** The plugin stores your key in Obsidian's plugin
  data folder. Fine for a hackathon and a testnet wallet. **Not for a key
  holding real funds.** WalletConnect / Snap-based signing is on the roadmap.
- **Desktop-only.** The plugin needs Node APIs (`crypto`) and is marked
  `isDesktopOnly: true`. Mobile Obsidian is not supported yet.

---

## Quick start (60 seconds)

### Requirements

- Desktop Obsidian 1.5 or newer
- Node.js 24 and pnpm 10
- A Braga testnet wallet with a little GLM for gas
  ([Braga explorer](https://explorer.braga.hoodi.arkiv.network))

### Install

```bash
# 1. Clone and build the plugin
git clone https://github.com/FritzDVL/arkivault.git
cd arkivault
pnpm install
pnpm --filter @workspace/obsidian-plugin run build

# 2. Drop the build into your vault
VAULT=/path/to/YourObsidianVault
mkdir -p "$VAULT/.obsidian/plugins/on-chain-second-brain"
cp artifacts/obsidian-plugin/dist/{main.js,manifest.json,styles.css} \
   "$VAULT/.obsidian/plugins/on-chain-second-brain/"

# 3. Generate a fresh testnet key (do NOT use a key that holds real funds)
echo "0x$(openssl rand -hex 32)"
```

In Obsidian: **Settings → Community plugins → Installed → enable
"On-Chain Second Brain"**, then open the plugin settings and paste the key
from step 3.

### Use it

Plugin commands (open with `Ctrl/Cmd-P`):

- **Push all notes to Arkiv** — encrypts and uploads every note in your vault
- **Pull all notes from Arkiv** — downloads and decrypts every note your
  wallet owns into the vault
- **Open sync log** — opens a right-pane view with every push / pull / error,
  with clickable tx hashes and entity keys
- **Test Arkiv connection** — sanity-checks RPC + wallet derivation

Auto-sync is on by default. Whenever you edit a note Obsidian fires a
debounced push (default 1.5 s) so your vault stays in sync as you write.

The status bar at the bottom of Obsidian shows one of:
`synced` · `syncing` · `offline` · `error` · `no wallet`.

---

## Repository commands

Run from the repo root unless noted.

| Command                                                            | What it does                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| `pnpm install`                                                     | Install all workspace dependencies                        |
| `pnpm run typecheck`                                               | Typecheck every package                                   |
| `pnpm run build`                                                   | Typecheck + build every package                           |
| `pnpm --filter @workspace/obsidian-plugin run build`               | Build just the plugin (`dist/main.js` + assets)           |
| `pnpm --filter @workspace/obsidian-plugin run typecheck`           | Typecheck just the plugin                                 |
| `pnpm --filter @workspace/landing run dev`                         | Run the landing page locally                              |
| `pnpm --filter @workspace/api-server run dev`                      | Run the API server scaffold (port 5000)                   |

The plugin build is a single `esbuild` step that bundles the
[`@arkiv-network/sdk`](https://www.npmjs.com/package/@arkiv-network/sdk)
inline (so users don't need their own Node deps inside Obsidian) and copies
`manifest.json` + `styles.css` next to the output `main.js`.

---

## Architecture decisions

- **No backend by design.** Arkiv is the database. Anything that would belong
  in an API server (auth, storage, multi-device sync) is delegated to the
  chain + the user's key.
- **One Entity per save, not per note.** A note's history is the set of
  Entities sharing the same `noteId` attribute. Pull always picks the latest
  one by `createdAtBlock`. This gives you free time-travel on chain at the
  cost of more writes.
- **Encryption envelope is versioned.** Payload bytes are
  `[version:1][iv:12][ciphertext][tag:16]` so the format can evolve
  (e.g. swap key derivation, add CRDT framing) without breaking older
  entities.
- **All SDK calls live in one file** (`src/arkiv-client.ts`). If the Arkiv
  SDK shape changes, the blast radius is tiny.

---

## Repo layout (where things live)

```
artifacts/
  obsidian-plugin/
    src/
      main.ts            ← plugin entry, command + event registration, status bar
      arkiv-client.ts    ← all @arkiv-network/sdk usage (push, pull, query)
      crypto.ts          ← AES-256-GCM envelope, key derivation, path → noteId
      sync-engine.ts     ← debounced auto-push, pull merge, state machine
      settings.ts        ← settings shape + defaults
      settings-tab.ts    ← Obsidian settings UI
      log-view.ts        ← sidebar sync log view
      sync-log.ts        ← in-memory event log
      modals.ts          ← confirmation dialogs
    manifest.json        ← Obsidian plugin manifest
    esbuild.config.mjs   ← build config (platform: node, externalises Obsidian)
    styles.css           ← status-bar dot styles
    README.md            ← plugin-level usage docs
    DEMO.md              ← 60-second demo script
  landing/               ← marketing site (React + Vite + Tailwind)
  api-server/            ← optional Express scaffold
  mockup-sandbox/        ← design iteration sandbox
```

---

## Roadmap

Tracked as project tasks in the repo:

- WalletConnect / Snap-based signing — get the private key off disk
- Conflict-safe sync (CRDT or three-way merge) — survive concurrent edits
- A read-only mobile companion app (Expo) — read your vault from your phone
- Search and filter across on-chain notes
- Sync history that survives Obsidian restarts

---

## Acknowledgements

Built on [Arkiv](https://arkiv.network) using
[`@arkiv-network/sdk`](https://www.npmjs.com/package/@arkiv-network/sdk).
Made for the [Network School (NS) × Arkiv](https://www.ethns.io/) hackathon.

## License

MIT.
