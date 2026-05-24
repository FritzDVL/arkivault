import { Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { ArkivClient } from "./arkiv-client";
import { ConfirmModal } from "./modals";
import { OCSBSettingTab } from "./settings-tab";
import { DEFAULT_SETTINGS, isValidPrivateKey, type PluginSettings } from "./settings";
import { SYNC_LOG_VIEW_TYPE, SyncLogView } from "./log-view";
import { SyncLog } from "./sync-log";
import { SyncEngine, type SyncState } from "./sync-engine";

export default class OnChainSecondBrainPlugin extends Plugin {
  settings: PluginSettings = { ...DEFAULT_SETTINGS };
  private arkiv: ArkivClient | null = null;
  private engine!: SyncEngine;
  private log = new SyncLog();
  private statusBarEl: HTMLElement | null = null;

  async onload() {
    await this.loadSettings();
    this.rebuildClient();

    this.engine = new SyncEngine({
      app: this.app,
      settings: () => this.settings,
      arkiv: () => this.arkiv,
      log: this.log,
      onStateChange: (state, pending) => this.renderStatusBar(state, pending),
    });

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("ocsb-status-bar");
    this.renderStatusBar(this.arkiv ? "synced" : "no-wallet", 0);

    this.registerView(
      SYNC_LOG_VIEW_TYPE,
      (leaf) =>
        new SyncLogView(
          leaf,
          this.log,
          () => this.arkiv?.address ?? null,
          (key) => this.arkiv?.explorerEntityUrl(key as `0x${string}`) ?? "#",
        ),
    );

    this.addCommand({
      id: "ocsb-open-sync-log",
      name: "Open Arkiv sync log",
      callback: () => this.activateLogView(),
    });

    this.addCommand({
      id: "ocsb-push-vault",
      name: "Push vault to Arkiv",
      callback: () => this.runPushAll(),
    });

    this.addCommand({
      id: "ocsb-pull-vault",
      name: "Pull vault from Arkiv",
      callback: () => this.runPullAll(),
    });

    this.addCommand({
      id: "ocsb-push-current-note",
      name: "Push current note to Arkiv",
      editorCheckCallback: (checking, _editor, ctx) => {
        const file = ctx.file;
        if (!file || file.extension !== "md") return false;
        if (checking) return true;
        this.engine.scheduleAutoPush(file);
        return true;
      },
    });

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile) this.engine.scheduleAutoPush(file);
      }),
    );
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof TFile) this.engine.scheduleAutoPush(file);
      }),
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        this.engine.cancelAuto(file.path);
      }),
    );

    this.addRibbonIcon("database", "Open Arkiv sync log", () => this.activateLogView());

    this.addSettingTab(
      new OCSBSettingTab(
        {
          app: this.app,
          settings: this.settings,
          saveSettings: () => this.saveSettings(),
          rebuildClient: () => this.rebuildClient(),
          getClient: () => this.arkiv,
        },
        this,
      ),
    );

    this.log.add({
      type: "info",
      message: this.arkiv
        ? `Loaded. Wallet ${this.arkiv.address}`
        : "Loaded. No wallet configured — open Settings → On-Chain Second Brain.",
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(SYNC_LOG_VIEW_TYPE);
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  rebuildClient() {
    if (isValidPrivateKey(this.settings.privateKey)) {
      try {
        this.arkiv = new ArkivClient(this.settings.privateKey);
      } catch (err) {
        this.arkiv = null;
        const msg = err instanceof Error ? err.message : String(err);
        new Notice(`Failed to initialize Arkiv client: ${msg}`);
      }
    } else {
      this.arkiv = null;
    }
    this.renderStatusBar(this.arkiv ? "synced" : "no-wallet", 0);
  }

  private async activateLogView() {
    const existing = this.app.workspace.getLeavesOfType(SYNC_LOG_VIEW_TYPE);
    let leaf: WorkspaceLeaf | null = existing[0] ?? null;
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: SYNC_LOG_VIEW_TYPE, active: true });
      }
    }
    if (leaf) this.app.workspace.revealLeaf(leaf);
  }

  private renderStatusBar(state: SyncState, pending?: number) {
    if (!this.statusBarEl) return;
    this.statusBarEl.empty();
    const dot = this.statusBarEl.createSpan({ cls: `ocsb-status-dot ${state}` });
    dot;
    let text = "Arkiv: synced";
    switch (state) {
      case "syncing":
        text = `Arkiv: syncing ${pending ?? ""}`.trim();
        break;
      case "error":
        text = "Arkiv: error";
        break;
      case "offline":
        text = "Arkiv: offline";
        break;
      case "no-wallet":
        text = "Arkiv: no wallet";
        break;
      case "synced":
        text = "Arkiv: synced";
        break;
    }
    this.statusBarEl.createSpan({ text });
  }

  private runPushAll() {
    if (!this.arkiv) {
      new Notice("Set a wallet private key in plugin settings first.");
      return;
    }
    void this.engine.pushAll();
  }

  private runPullAll() {
    if (!this.arkiv) {
      new Notice("Set a wallet private key in plugin settings first.");
      return;
    }
    new ConfirmModal(this.app, {
      title: "Pull vault from Arkiv?",
      body: "This will overwrite local notes whose paths match entities found on-chain. New notes from other devices will be created. Local-only notes are kept untouched.",
      confirmText: "Pull and overwrite",
      destructive: true,
      onConfirm: () => void this.engine.pullAll(),
    }).open();
  }
}
