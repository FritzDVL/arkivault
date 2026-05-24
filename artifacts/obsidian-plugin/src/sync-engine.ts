import { App, Notice, TFile, normalizePath } from "obsidian";
import { ArkivClient } from "./arkiv-client";
import { contentHash, decryptUtf8, encryptUtf8, noteIdFromPath } from "./crypto";
import type { PluginSettings } from "./settings";
import type { SyncLog } from "./sync-log";

export type SyncState = "synced" | "syncing" | "error" | "offline" | "no-wallet";

interface NoteEnvelope {
  path: string;
  content: string;
  updatedAt: number;
}

export interface SyncEngineDeps {
  app: App;
  settings: () => PluginSettings;
  arkiv: () => ArkivClient | null;
  log: SyncLog;
  onStateChange: (state: SyncState, pending?: number) => void;
}

export class SyncEngine {
  private pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastHashByPath = new Map<string, string>();
  private inflight = 0;
  /** Sticky failure flag — cleared only when a subsequent push or pull succeeds. */
  private lastErrorKind: "offline" | "error" | null = null;

  constructor(private readonly deps: SyncEngineDeps) {}

  private clearError() {
    if (this.lastErrorKind !== null) {
      this.lastErrorKind = null;
      this.emit();
    }
  }

  scheduleAutoPush(file: TFile) {
    const s = this.deps.settings();
    if (!s.autoSync) return;
    if (file.extension !== "md") return;
    const existing = this.pendingTimers.get(file.path);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.pendingTimers.delete(file.path);
      void this.pushFile(file).catch((err) => this.recordError(file.path, err));
    }, s.debounceMs);
    this.pendingTimers.set(file.path, timer);
    this.emit();
  }

  cancelAuto(filePath: string) {
    const t = this.pendingTimers.get(filePath);
    if (t) {
      clearTimeout(t);
      this.pendingTimers.delete(filePath);
      this.emit();
    }
  }

  /** Push every markdown file in the vault, serially. Returns counts. */
  async pushAll(): Promise<{ pushed: number; skipped: number; failed: number }> {
    const arkiv = this.deps.arkiv();
    if (!arkiv) {
      new Notice("On-Chain Second Brain: no wallet configured.");
      return { pushed: 0, skipped: 0, failed: 0 };
    }
    const files = this.deps.app.vault.getMarkdownFiles();
    let pushed = 0;
    let skipped = 0;
    let failed = 0;
    const notice = new Notice(`Pushing ${files.length} note(s) to Arkiv…`, 0);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const result = await this.pushFile(f, { silent: true });
        if (result === "pushed") pushed++;
        else if (result === "skipped") skipped++;
        notice.setMessage(`Pushing to Arkiv: ${i + 1}/${files.length} (${pushed} new, ${skipped} unchanged)`);
      } catch (err) {
        failed++;
        this.recordError(f.path, err);
      }
    }
    notice.hide();
    new Notice(`Arkiv push complete: ${pushed} pushed, ${skipped} unchanged, ${failed} failed.`);
    return { pushed, skipped, failed };
  }

  /** Pull all entities owned by the wallet and write them into the vault. */
  async pullAll(): Promise<{ written: number; skipped: number; failed: number }> {
    const arkiv = this.deps.arkiv();
    if (!arkiv) {
      new Notice("On-Chain Second Brain: no wallet configured.");
      return { written: 0, skipped: 0, failed: 0 };
    }
    const s = this.deps.settings();
    const notice = new Notice("Pulling vault from Arkiv…", 0);
    this.inflight++;
    this.emit();
    let written = 0;
    let skipped = 0;
    let failed = 0;
    try {
      const entities = await arkiv.pullAll(s.category);
      // Group by noteId → keep the highest createdAtBlock (last-write-wins).
      const latestByNoteId = new Map<string, (typeof entities)[number]>();
      for (const e of entities) {
        const nid = e.attributes["noteId"] ?? e.entityKey;
        const prev = latestByNoteId.get(nid);
        if (!prev || e.createdAtBlock > prev.createdAtBlock) {
          latestByNoteId.set(nid, e);
        }
      }
      this.clearError();
      for (const e of latestByNoteId.values()) {
        try {
          const decoded = decryptUtf8(e.payload, s.privateKey);
          const env = JSON.parse(decoded) as NoteEnvelope;
          if (!env.path || typeof env.content !== "string") {
            skipped++;
            continue;
          }
          const path = normalizePath(env.path);
          await this.writeFileEnsuringFolder(path, env.content);
          this.lastHashByPath.set(path, contentHash(env.content));
          written++;
          this.deps.log.add({
            type: "pull",
            file: path,
            message: `Pulled from Arkiv (${e.payload.length} bytes encrypted)`,
            entityKey: e.entityKey,
          });
        } catch (err) {
          failed++;
          this.recordError(e.entityKey, err);
        }
      }
    } catch (err) {
      this.recordError("(pull)", err);
      throw err;
    } finally {
      this.inflight--;
      notice.hide();
      this.emit();
    }
    new Notice(`Arkiv pull complete: ${written} written, ${skipped} skipped, ${failed} failed.`);
    return { written, skipped, failed };
  }

  private async pushFile(
    file: TFile,
    opts?: { silent?: boolean },
  ): Promise<"pushed" | "skipped"> {
    const arkiv = this.deps.arkiv();
    if (!arkiv) return "skipped";
    const s = this.deps.settings();
    const content = await this.deps.app.vault.read(file);
    const h = contentHash(content);
    if (this.lastHashByPath.get(file.path) === h) return "skipped";

    this.inflight++;
    this.emit();
    try {
      const envelope: NoteEnvelope = {
        path: file.path,
        content,
        updatedAt: Date.now(),
      };
      const encrypted = encryptUtf8(JSON.stringify(envelope), s.privateKey);
      const result = await arkiv.push({
        noteId: noteIdFromPath(file.path),
        encryptedPayload: encrypted,
        expiresInSeconds: s.expiresInDays * 24 * 60 * 60,
        category: s.category,
      });
      this.lastHashByPath.set(file.path, h);
      this.deps.log.add({
        type: "push",
        file: file.path,
        message: `Pushed to Arkiv (${encrypted.length} bytes encrypted)`,
        entityKey: result.entityKey,
        txHash: result.txHash,
      });
      this.lastErrorKind = null;
      if (!opts?.silent) new Notice(`Synced "${file.name}" to Arkiv`);
      return "pushed";
    } finally {
      this.inflight--;
      this.emit();
    }
  }

  private async writeFileEnsuringFolder(path: string, content: string): Promise<void> {
    const folder = path.split("/").slice(0, -1).join("/");
    if (folder) {
      const existing = this.deps.app.vault.getAbstractFileByPath(folder);
      if (!existing) {
        try {
          await this.deps.app.vault.createFolder(folder);
        } catch {
          /* folder may already exist; ignore */
        }
      }
    }
    const existing = this.deps.app.vault.getAbstractFileByPath(path);
    if (existing && existing instanceof TFile) {
      await this.deps.app.vault.modify(existing, content);
    } else {
      await this.deps.app.vault.create(path, content);
    }
  }

  private recordError(subject: string, err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    this.deps.log.add({ type: "error", file: subject, message });
    // Classify network/RPC failures as "offline" so the status bar communicates
    // recoverable connectivity issues distinctly from logic errors.
    this.lastErrorKind = isNetworkError(err) ? "offline" : "error";
    new Notice(`Arkiv sync error on ${subject}: ${message}`);
    this.emit();
  }

  private emit() {
    const arkiv = this.deps.arkiv();
    const pending = this.pendingTimers.size + this.inflight;
    if (!arkiv) {
      this.deps.onStateChange("no-wallet", pending);
      return;
    }
    if (pending > 0) {
      this.deps.onStateChange("syncing", pending);
      return;
    }
    if (this.lastErrorKind === "offline") {
      this.deps.onStateChange("offline", 0);
      return;
    }
    if (this.lastErrorKind === "error") {
      this.deps.onStateChange("error", 0);
      return;
    }
    this.deps.onStateChange("synced", 0);
  }
}

function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return /network|fetch|ECONN|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|HTTP request failed|timeout|getaddrinfo/i.test(
    msg,
  );
}
