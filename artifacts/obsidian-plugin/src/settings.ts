export interface PluginSettings {
  privateKey: string;
  autoSync: boolean;
  debounceMs: number;
  category: string;
  expiresInDays: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  privateKey: "",
  autoSync: true,
  debounceMs: 2000,
  category: "obsidian-second-brain",
  expiresInDays: 30,
};

export const BRAGA_EXPLORER = "https://explorer.braga.hoodi.arkiv.network";
export const BRAGA_RPC = "https://braga.hoodi.arkiv.network/rpc";

export function isValidPrivateKey(key: string): key is `0x${string}` {
  return /^0x[0-9a-fA-F]{64}$/.test(key);
}
