import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = 0x01;
const IV_LEN = 12;
const TAG_LEN = 16;

function deriveKey(privateKey: string): Buffer {
  const hex = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  return createHash("sha256").update(Buffer.from(hex, "hex")).digest();
}

export function encryptUtf8(plaintext: string, privateKey: string): Uint8Array {
  const key = deriveKey(privateKey);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return new Uint8Array(Buffer.concat([Buffer.from([VERSION]), iv, ct, tag]));
}

export function decryptUtf8(payload: Uint8Array, privateKey: string): string {
  if (payload.length < 1 + IV_LEN + TAG_LEN) {
    throw new Error("Payload too short to be a valid encrypted blob");
  }
  const buf = Buffer.from(payload);
  const version = buf[0];
  if (version !== VERSION) {
    throw new Error(`Unsupported payload version: 0x${version.toString(16)}`);
  }
  const iv = buf.subarray(1, 1 + IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const ct = buf.subarray(1 + IV_LEN, buf.length - TAG_LEN);
  const key = deriveKey(privateKey);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

export function noteIdFromPath(path: string): string {
  return createHash("sha1").update(path, "utf8").digest("hex");
}

export function contentHash(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
