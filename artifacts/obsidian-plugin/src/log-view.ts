import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type { SyncLog, SyncEvent } from "./sync-log";

export const SYNC_LOG_VIEW_TYPE = "ocsb-sync-log-view";

export class SyncLogView extends ItemView {
  private unsubscribe?: () => void;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly log: SyncLog,
    private readonly getWalletAddress: () => string | null,
    private readonly entityExplorerUrl: (key: string) => string,
  ) {
    super(leaf);
  }

  getViewType() {
    return SYNC_LOG_VIEW_TYPE;
  }

  getDisplayText() {
    return "Arkiv Sync Log";
  }

  getIcon() {
    return "database";
  }

  async onOpen() {
    this.render();
    this.unsubscribe = this.log.subscribe(() => this.render());
  }

  async onClose() {
    this.unsubscribe?.();
  }

  private render() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("ocsb-log-view");

    const header = root.createDiv({ cls: "ocsb-log-header" });
    header.createSpan({ text: "On-Chain Second Brain" });
    const clearBtn = header.createEl("a", { text: "clear" });
    clearBtn.onclick = (e) => {
      e.preventDefault();
      this.log.clear();
    };

    const wallet = this.getWalletAddress();
    const walletEl = root.createDiv({ cls: "ocsb-log-wallet" });
    if (wallet) {
      walletEl.setText(`Wallet: ${wallet}`);
    } else {
      walletEl.setText("No wallet configured. Set a private key in plugin settings.");
    }

    const events = this.log.list();
    if (events.length === 0) {
      const empty = root.createDiv({ cls: "ocsb-log-empty" });
      empty.setText("No sync events yet.");
      return;
    }

    for (const event of events) {
      this.renderEvent(root, event);
    }
  }

  private renderEvent(parent: HTMLElement, event: SyncEvent) {
    const entry = parent.createDiv({ cls: "ocsb-log-entry" });
    const head = entry.createDiv({ cls: "ocsb-log-entry-head" });
    head.createSpan({ cls: `ocsb-log-type ${event.type}`, text: event.type });
    head.createSpan({ cls: "ocsb-log-ts", text: new Date(event.ts).toLocaleTimeString() });

    if (event.file) {
      entry.createDiv({ cls: "ocsb-log-file", text: event.file });
    }
    entry.createDiv({ cls: "ocsb-log-meta", text: event.message });

    if (event.entityKey) {
      const link = entry.createDiv({ cls: "ocsb-log-meta" });
      const a = link.createEl("a", {
        text: `entity ${event.entityKey.slice(0, 10)}…`,
        href: this.entityExplorerUrl(event.entityKey),
      });
      a.setAttr("target", "_blank");
      a.setAttr("rel", "noopener");
    }
  }

  // Suppress unused import warning for setIcon if we wire icons later
  protected _ensureSetIconImported() {
    setIcon;
  }
}
