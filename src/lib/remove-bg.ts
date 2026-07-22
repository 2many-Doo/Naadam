import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";

/**
 * Зургийн арын background хасаад PNG buffer буцаана.
 */
export async function removeImageBackground(
  input: Buffer
): Promise<Buffer> {
  const tmpDir = await mkdir(path.join(os.tmpdir(), "bracket-bg"), {
    recursive: true,
  }).then(() => path.join(os.tmpdir(), "bracket-bg"));

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const tmpIn = path.join(tmpDir, `${id}.jpg`);

  try {
    // imgly JPEG/PNG хүлээн авна
    await sharp(input)
      .rotate() // EXIF orientation
      .jpeg({ quality: 92 })
      .toFile(tmpIn);

    const blob = await removeBackground(tmpIn, {
      output: { format: "image/png", quality: 0.9 },
    });

    return Buffer.from(await blob.arrayBuffer());
  } finally {
    await unlink(tmpIn).catch(() => {});
  }
}
