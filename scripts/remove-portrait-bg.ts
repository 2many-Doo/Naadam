/**
 * Цээж зургийн арын bg хасаад public/wrestlers/*.png үүсгэнэ.
 * npx tsx scripts/remove-portrait-bg.ts
 */
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";
import { WRESTLER_PORTRAITS } from "../src/lib/wrestler-portraits";

const OUT_DIR = path.join(process.cwd(), "public", "wrestlers");
const TMP_DIR = path.join(process.cwd(), "public", "wrestlers", "_tmp");

function toJpgUrl(url: string) {
  const u = new URL(url);
  u.searchParams.set("fm", "jpg");
  u.searchParams.set("q", "85");
  return u.toString();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const unique = [...new Set(WRESTLER_PORTRAITS)];
  console.log(`Processing ${unique.length} portraits...`);

  for (let i = 0; i < unique.length; i++) {
    const url = toJpgUrl(unique[i]);
    const tmp = path.join(TMP_DIR, `${i + 1}.jpg`);
    const out = path.join(OUT_DIR, `${i + 1}.png`);
    process.stdout.write(`[${i + 1}/${unique.length}] `);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = Buffer.from(await res.arrayBuffer());
      // imgly JPEG/PNG хүлээн авна — sharp-ээр баталгаажуулна
      await sharp(raw).jpeg({ quality: 90 }).toFile(tmp);
      const blob = await removeBackground(tmp, {
        output: { format: "image/png", quality: 0.9 },
      });
      const buf = Buffer.from(await blob.arrayBuffer());
      await writeFile(out, buf);
      await unlink(tmp).catch(() => {});
      console.log(`ok → /wrestlers/${i + 1}.png`);
    } catch (err) {
      console.error(`FAIL`, err instanceof Error ? err.message : err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
