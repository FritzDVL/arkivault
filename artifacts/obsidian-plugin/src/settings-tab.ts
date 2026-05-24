import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { ArkivClient } from "./arkiv-client";
import { isValidPrivateKey, type PluginSettings } from "./settings";

export interface SettingsTabHost {
  app: App;
  settings: PluginSettings;
  saveSettings: () => Promise<void>;
  rebuildClient: () => void;
  getClient: () => ArkivClient | null;
}

export class OCSBSettingTab extends PluginSettingTab {
  // PluginSettingTab.plugin is typed as Plugin; we keep a typed host instead.
  constructor(
    private readonly host: SettingsTabHost,
    plugin: import("obsidian").Plugin,
  ) {
    super(host.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "On-Chain Second Brain" });
    const intro = containerEl.createEl("p");
    intro.setText(
      "Your vault syncs to the Arkiv L3 (Braga testnet) as encrypted entities owned by your wallet. No server, no backend — Arkiv is the database.",
    );

    const warn = containerEl.createDiv({ cls: "ocsb-settings-warning" });
    warn.createEl("strong", { text: "Testnet only. " });
    warn.appendText(
      "This plugin signs transactions with a raw private key stored locally. Use a fresh testnet key — never paste a mainnet private key or one that holds real funds.",
    );

    containerEl.createDiv({
      cls: "ocsb-settings-section-title",
      text: "Wallet",
    });

    new Setting(containerEl)
      .setName("Private key")
      .setDesc("0x-prefixed 64-char hex. Stored only in this vault's plugin data.")
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.spellcheck = false;
        text
          .setPlaceholder("0x…")
          .setValue(this.host.settings.privateKey)
          .onChange(async (value) => {
            this.host.settings.privateKey = value.trim();
            await this.host.saveSettings();
            this.host.rebuildClient();
            this.refreshDerived();
          });
      });

    const derived = containerEl.createDiv({ cls: "ocsb-settings-derived" });
    derived.id = "ocsb-derived-address";
    this.refreshDerived(derived);

    new Setting(containerEl)
      .setName("Test connection")
      .setDesc("Verify the Braga RPC and your wallet derivation.")
      .addButton((b) =>
        b.setButtonText("Test").onClick(async () => {
          const client = this.host.getClient();
          if (!client) {
            new Notice("Set a valid private key first.");
            return;
          }
          b.setButtonText("Testing…").setDisabled(true);
          try {
            const { entityCount, chainId } = await client.testConnection();
            new Notice(`Connected to Braga (chainId ${chainId}). ${entityCount} entities indexed.`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            new Notice(`Connection failed: ${msg}`);
          } finally {
            b.setButtonText("Test").setDisabled(false);
          }
        }),
      );

    containerEl.createDiv({
      cls: "ocsb-settings-section-title",
      text: "Sync behavior",
    });

    new Setting(containerEl)
      .setName("Auto-sync on edit")
      .setDesc("Push notes to Arkiv automatically after they change.")
      .addToggle((t) =>
        t.setValue(this.host.settings.autoSync).onChange(async (v) => {
          this.host.settings.autoSync = v;
          await this.host.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Debounce (ms)")
      .setDesc("How long to wait after the last edit before syncing.")
      .addText((t) =>
        t
          .setValue(String(this.host.settings.debounceMs))
          .onChange(async (v) => {
            const n = Math.max(250, Math.min(60000, Number(v) || 2000));
            this.host.settings.debounceMs = n;
            await this.host.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Entity TTL (days)")
      .setDesc("How long each on-chain entity stays in the query index.")
      .addText((t) =>
        t
          .setValue(String(this.host.settings.expiresInDays))
          .onChange(async (v) => {
            const n = Math.max(1, Math.min(365, Number(v) || 30));
            this.host.settings.expiresInDays = n;
            await this.host.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Category attribute")
      .setDesc("Tag used to query your vault entities. Change to namespace separate vaults under one wallet.")
      .addText((t) =>
        t.setValue(this.host.settings.category).onChange(async (v) => {
          this.host.settings.category = v.trim() || "obsidian-second-brain";
          await this.host.saveSettings();
        }),
      );
  }

  private refreshDerived(el?: HTMLElement) {
    const target = el ?? this.containerEl.querySelector<HTMLElement>("#ocsb-derived-address");
    if (!target) return;
    target.empty();
    if (!isValidPrivateKey(this.host.settings.privateKey)) {
      target.setText("No valid private key set.");
      return;
    }
    const client = this.host.getClient();
    target.setText(`Wallet address: ${client?.address ?? "(deriving…)"}`);
  }
}
