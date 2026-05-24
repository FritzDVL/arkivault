# 60-Second Hackathon Demo Script

> "Obsidian is the world's favorite second brain — but your notes are stuck on one disk. We made them on-chain, with no server. Here's how."

## Pre-recording setup

1. Two Obsidian vaults open side by side:
   - **Vault A** — "Phone (or Laptop A)" — has the plugin installed and contains notes.
   - **Vault B** — "Laptop B" — has the plugin installed and is **empty**.
2. Both vaults use the **same private key** in plugin settings (generate one with `openssl rand -hex 32`).
3. Both vaults show the right sidebar Arkiv Sync Log.
4. Status bar in both windows reads `Arkiv: synced`.

## Live script

**0:00 — Frame the problem.**
> "Obsidian is local-first by design. Cloud sync means renting a server. We replaced the server with Arkiv — the database lives on-chain."

**0:08 — Show Vault A.**
- Open `welcome.md`, type a new heading: `# Idea: serverless second brain`.
- Status bar flicks `Arkiv: syncing 1` → `Arkiv: synced`.
- The Sync Log shows a new `PUSH` entry with a clickable entity link to the Braga explorer.

> "Every save AES-GCM encrypts the note with a key derived from my wallet, then writes it to Arkiv as an entity owned by my address. No server in between."

**0:25 — Show the explorer.**
- Click the entity link in the Sync Log.
- Braga explorer opens at `https://explorer.braga.hoodi.arkiv.network/entity/0x…`.
- Point out: the on-chain payload is encrypted bytes — anyone can see it exists, no one can read it.

**0:35 — Switch to Vault B (empty).**
- Open command palette → `Pull vault from Arkiv` → confirm.
- The Sync Log fills with `PULL` entries.
- The new `Idea: serverless second brain` note appears in the file tree and opens correctly.

> "This is the same vault, on another device. No DropBox, no iCloud, no Supabase. Just a wallet and Arkiv."

**0:50 — Close the loop.**
> "The killer feature: any future Arkiv-aware app — an AI mind-mapper, a graph view, a public-notes site — can plug my wallet in and read this vault natively. My second brain outlives any single app."

## Failure modes (so you don't panic on stage)

| Symptom | Likely cause | Fix |
|---|---|---|
| `Arkiv: error` on push | Wallet has no Braga GLM for gas | Hit the Braga faucet, then trigger a save |
| Pull writes nothing | Wrong private key (different wallet) | Re-paste the *exact* same key in both vaults |
| Status stays `Arkiv: no wallet` | Settings field is empty or malformed | Settings → On-Chain Second Brain → paste 0x-prefixed 64-hex key |
| `Test connection` fails | Braga RPC down or no internet | Try a curl against `https://braga.hoodi.arkiv.network/rpc` |

## Talking points if a judge asks…

- **"Where's the server?"** There isn't one. The plugin signs transactions locally with viem and ships them straight to a Braga RPC node. The repo has no backend code for sync.
- **"What about privacy?"** Payloads are AES-256-GCM encrypted with a key derived from the user's private key. Only `category` and `noteId` attributes are plaintext on-chain; `noteId` is a SHA-1 of the file path, so the path itself is hidden.
- **"What if Arkiv goes down?"** Obsidian keeps working — it's local-first. Sync pauses, resumes when RPC comes back. The vault is never blocked on chain availability.
- **"What's the path to production?"** Replace the paste-a-key UX with WalletConnect or a MetaMask Snap, add CRDT-based merge for concurrent edits, encrypt attribute metadata, ship to the Obsidian community plugin registry.

## Reference URLs

- Arkiv docs: https://docs.arkiv.network
- Braga explorer: https://explorer.braga.hoodi.arkiv.network
- Braga RPC: https://braga.hoodi.arkiv.network/rpc
- Network School x Ethereum: https://www.ethns.io/
