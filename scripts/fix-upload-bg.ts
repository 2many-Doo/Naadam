import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { removeImageBackground } from "../src/lib/remove-bg";

async function main() {
  const dir = path.join(process.cwd(), "public/uploads/wrestlers");
  const files = (await readdir(dir)).filter((f) =>
    /\.(jpg|jpeg|webp)$/i.test(f)
  );
  console.log("processing", files.length, "images");

  for (const f of files) {
    const full = path.join(dir, f);
    console.log("→", f);
    const input = await readFile(full);
    const out = await removeImageBackground(input);
    const pngName = f.replace(/\.(jpg|jpeg|webp)$/i, ".png");
    await writeFile(path.join(dir, pngName), out);
    await unlink(full).catch(() => {});
    console.log("  ok", pngName);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI — skip DB update");
    return;
  }

  await mongoose.connect(uri);
  const W = mongoose.connection.collection("wrestlers");
  const all = await W.find({}).toArray();
  let n = 0;
  for (const w of all) {
    if (typeof w.image === "string" && /\.(jpg|jpeg|webp)$/i.test(w.image)) {
      const next = w.image.replace(/\.(jpg|jpeg|webp)$/i, ".png");
      await W.updateOne({ _id: w._id }, { $set: { image: next } });
      n++;
      console.log("db", w.name, "→", next);
    }
  }
  console.log("updated", n, "wrestlers");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
