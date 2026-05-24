import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { eq, and } from "@arkiv-network/sdk/query";
import type { Hex } from "@arkiv-network/sdk";

import { BRAGA_EXPLORER } from "./settings";

export interface RemoteEntity {
  entityKey: Hex;
  payload: Uint8Array;
  attributes: Record<string, string>;
  createdAtBlock: bigint;
}

/**
 * Thin wrapper around the Arkiv SDK. The rest of the plugin must NEVER import
 * @arkiv-network/sdk directly — go through this class. That keeps the SDK
 * upgrade surface tiny if the API shifts again.
 */
export class ArkivClient {
  private readonly publicClient;
  private readonly walletClient;
  readonly address: Hex;

  constructor(privateKey: `0x${string}`) {
    const account = privateKeyToAccount(privateKey);
    this.address = account.address;
    this.publicClient = createPublicClient({
      chain: braga,
      transport: http(),
    });
    this.walletClient = createWalletClient({
      account,
      chain: braga,
      transport: http(),
    });
  }

  /** Cheap read used to verify RPC connectivity + wallet derivation. */
  async testConnection(): Promise<{ entityCount: number; chainId: number }> {
    const [entityCount, chainId] = await Promise.all([
      this.publicClient.getEntityCount(),
      this.publicClient.getChainId(),
    ]);
    return { entityCount, chainId };
  }

  async push(opts: {
    noteId: string;
    encryptedPayload: Uint8Array;
    expiresInSeconds: number;
    category: string;
    extraAttributes?: Record<string, string>;
  }): Promise<{ entityKey: Hex; txHash: string }> {
    const attributes = [
      { key: "category", value: opts.category },
      { key: "noteId", value: opts.noteId },
      ...Object.entries(opts.extraAttributes ?? {}).map(([key, value]) => ({ key, value })),
    ];
    const result = await this.walletClient.createEntity({
      payload: opts.encryptedPayload,
      attributes,
      contentType: "application/octet-stream",
      expiresIn: opts.expiresInSeconds,
    });
    return { entityKey: result.entityKey, txHash: result.txHash };
  }

  async pullAll(category: string): Promise<RemoteEntity[]> {
    const builder = this.publicClient
      .buildQuery()
      .where(and([eq("category", category)]))
      .ownedBy(this.address)
      .withPayload(true)
      .withAttributes(true)
      .withMetadata(true)
      .limit(500);
    const result = await builder.fetch();
    return result.entities.map((e) => this.normalizeEntity(e));
  }

  explorerEntityUrl(entityKey: Hex): string {
    return `${BRAGA_EXPLORER}/entity/${entityKey}`;
  }

  explorerTxUrl(txHash: string): string {
    return `${BRAGA_EXPLORER}/tx/${txHash}`;
  }

  private normalizeEntity(raw: unknown): RemoteEntity {
    const e = raw as {
      key?: Hex;
      entityKey?: Hex;
      payload?: Uint8Array | Buffer | string;
      stringAttributes?: Array<{ key: string; value: string }>;
      attributes?: Array<{ key: string; value: string }> | Record<string, string>;
      createdAtBlock?: bigint | string | number;
    };
    const entityKey = (e.entityKey ?? e.key ?? "0x") as Hex;
    let payload: Uint8Array;
    if (e.payload instanceof Uint8Array) {
      payload = e.payload;
    } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(e.payload)) {
      payload = new Uint8Array(e.payload);
    } else if (typeof e.payload === "string") {
      payload = new Uint8Array(Buffer.from(e.payload, "base64"));
    } else {
      payload = new Uint8Array();
    }
    const attrs: Record<string, string> = {};
    const attrSource = e.stringAttributes ?? e.attributes;
    if (Array.isArray(attrSource)) {
      for (const { key, value } of attrSource) attrs[key] = value;
    } else if (attrSource && typeof attrSource === "object") {
      for (const [k, v] of Object.entries(attrSource as Record<string, string>)) attrs[k] = String(v);
    }
    const block =
      typeof e.createdAtBlock === "bigint"
        ? e.createdAtBlock
        : e.createdAtBlock != null
          ? BigInt(e.createdAtBlock)
          : 0n;
    return { entityKey, payload, attributes: attrs, createdAtBlock: block };
  }
}
