export type SyncEventType = "push" | "pull" | "error" | "info";

export interface SyncEvent {
  id: number;
  ts: number;
  type: SyncEventType;
  file?: string;
  message: string;
  entityKey?: string;
  txHash?: string;
}

const MAX_EVENTS = 100;

export class SyncLog {
  private events: SyncEvent[] = [];
  private listeners = new Set<() => void>();
  private counter = 0;

  add(event: Omit<SyncEvent, "id" | "ts">) {
    this.events.unshift({ ...event, id: ++this.counter, ts: Date.now() });
    if (this.events.length > MAX_EVENTS) this.events.length = MAX_EVENTS;
    for (const l of this.listeners) l();
  }

  list(): readonly SyncEvent[] {
    return this.events;
  }

  clear() {
    this.events = [];
    for (const l of this.listeners) l();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
