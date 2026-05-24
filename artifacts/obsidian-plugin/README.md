# On-Chain Second Brain — Obsidian Plugin

A truly serverless second brain. Your Obsidian vault syncs to the **Arkiv L3** (Braga testnet) as encrypted entities owned by your wallet. No Supabase, no Firebase, no AWS — every device reads and writes directly to Arkiv via RPC.

- **Plain markdown stays local.** Obsidian works exactly the way you already use it.
- **Sync is end-to-end encrypted.** Notes are AES-GCM encrypted with a key derived from your private key before they leave your device.
- **Data portability.** Any other Arkiv-aware app can plug your wallet in and read your vault.

## Build

From the repo root:

```bash
pnpm --filter @workspace/obsidian-plugin install
pnpm --filter @workspace/obsidian-plugin run build
```

The bundle is emitted to `artifacts/obsidian-plugin/dist/`:

```
dist/
├── main.js
├── manifest.json
└── styles.css
```

## Install in an Obsidian vault

1. In Obsidian, enable **Settings → Community plugins → Turn on community plugins**.
2. Open your vault folder and create `.obsidian/plugins/on-chain-second-brain/`.
3. Copy the three files from `dist/` into that directory:
   ```bash
   mkdir -p /path/to/Vault/.obsidian/plugins/on-chain-second-brain
   cp artifacts/obsidian-plugin/dist/{main.js,manifest.json,styles.css} \
      /path/to/Vault/.obsidian/plugins/on-chain-second-brain/
   ```
4. In Obsidian → Settings → Community plugins → **Reload installed plugins** and toggle **On-Chain Second Brain** on.

## Configure

Open **Settings → On-Chain Second Brain** and:

1. Paste a **Braga testnet** private key (0x-prefixed, 64 hex chars). Generate one with `openssl rand -hex 32` and prefix with `0x` — never use a mainnet key.
2. Click **Test connection** to confirm your wallet derives correctly and the RPC is reachable.
3. (Optional) Adjust auto-sync, debounce, and TTL.

The plugin adds:

- A status bar item: `Arkiv: synced | syncing N | no wallet | error`.
- A ribbon icon (database) to open the **Arkiv Sync Log** in the right sidebar.
- Command palette entries:
  - **Push vault to Arkiv** — uploads every markdown file in the vault.
  - **Pull vault from Arkiv** — fetches all your on-chain entities and rehydrates files.
  - **Push current note to Arkiv** — immediate push for the active note.

## Cross-device demo

1. Set the same private key in two separate vaults (e.g. two machines, or two vaults on one machine).
2. Vault A: write a note. Auto-sync pushes it to Arkiv after ~2s.
3. Vault B: run **Pull vault from Arkiv**. The note appears.

See [`DEMO.md`](./DEMO.md) for the full 60-second hackathon demo script.

## How it works

```
┌──────────────────┐                ┌───────────────────┐                ┌──────────────────┐
│  Obsidian Vault  │ ◄────────────► │ ARKIV L3 (Braga)  │ ◄────────────► │  Obsidian Vault  │
│   (laptop A)     │  (RPC + sign)  │   DB-Chain        │  (RPC + sign)  │   (laptop B)     │
└──────────────────┘                └───────────────────┘                └──────────────────┘
   Local Markdown                     Universal Data Layer                 Local Markdown
```

On the write side, each note becomes one Arkiv Entity:

- `payload`: AES-256-GCM encrypted JSON envelope `{ path, content, updatedAt }`
- `attributes` (plaintext, used for querying):
  - `category` — namespaces your vault (default `obsidian-second-brain`)
  - `noteId` — SHA-1 of the file path (pseudonymous; path itself is encrypted)
- `contentType`: `application/octet-stream`
- `expiresIn`: configurable (default 30 days)

On the read side, the plugin issues:

```ts
publicClient.buildQuery()
  .where(and([eq("category", category)]))
  .ownedBy(walletAddress)
  .withPayload(true)
  .withAttributes(true)
  .fetch()
```

…groups results by `noteId`, keeps the entity with the highest `createdAtBlock`, decrypts the payload, and writes the file back to its original path.

## Honest limitations (hackathon scope)

- **Testnet only.** No mainnet path. The settings tab refuses to look like a real wallet.
- **Last-write-wins.** No CRDT/merge — two devices editing the same note simultaneously can lose data.
- **Private key on disk.** The key sits in plugin data (`.obsidian/plugins/on-chain-second-brain/data.json`). Real production would use OS keychain or a Snap/WalletConnect flow.
- **Desktop Obsidian only.** Mobile Obsidian's stripped runtime can't load the Arkiv SDK's Node-flavored dependencies.
- **Markdown only.** Images, PDFs, and other attachments are not synced in v1.

These are intentional v1 cuts. The architecture itself is production-ready: the bottleneck is wallet UX and conflict resolution, not Arkiv.

## License

MIT (or whatever your hackathon submission picks). See `LICENSE` once added.
