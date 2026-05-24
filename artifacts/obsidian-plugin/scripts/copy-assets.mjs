import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });

for (const file of ["manifest.json", "styles.css"]) {
  const src = join(root, file);
  if (existsSync(src)) {
    copyFileSync(src, join(dist, file));
    console.log(`copied ${file} -> dist/${file}`);
  }
}
