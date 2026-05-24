import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
  constructor(
    app: App,
    private readonly opts: {
      title: string;
      body: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
      onConfirm: () => void;
    },
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.opts.title });
    contentEl.createEl("p", { text: this.opts.body });
    new Setting(contentEl)
      .addButton((b) =>
        b.setButtonText(this.opts.cancelText ?? "Cancel").onClick(() => this.close()),
      )
      .addButton((b) => {
        b.setButtonText(this.opts.confirmText ?? "Confirm");
        if (this.opts.destructive) b.setWarning();
        b.onClick(() => {
          this.close();
          this.opts.onConfirm();
        });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
