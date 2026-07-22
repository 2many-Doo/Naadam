import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import { Wrestler } from "@/models";
import { parseWrestlersFromExcel } from "@/lib/parse-wrestlers-excel";
import { removeImageBackground } from "@/lib/remove-bg";

export const runtime = "nodejs";
export const maxDuration = 300;

const NO_PHOTO = "/no-photo.svg";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Excel файл сонгоно уу (.xlsx)" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Зурагтай оруулахын тулд .xlsx файл ашиглана уу" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows;
    try {
      rows = await parseWrestlersFromExcel(buffer);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Excel уншихад алдаа гарлаа";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (rows.length > 64) {
      return NextResponse.json(
        {
          error: `Хэтэрхий олон мөр (${rows.length}). Хамгийн ихдээ 64 бөх оруулна.`,
        },
        { status: 400 }
      );
    }

    const withImageCount = rows.filter(
      (r) => r.imageBuffer && r.imageBuffer.length > 0
    ).length;

    if (withImageCount === 0) {
      return NextResponse.json(
        {
          error:
            "Excel-ээс зураг олдсонгүй. Мөр бүрт E баганад зураг оруулсан .xlsx файл ашиглана уу.",
        },
        { status: 400 }
      );
    }

    const replace = formData.get("replace") === "true";
    if (replace) {
      await Wrestler.deleteMany({});
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "wrestlers");

    if (replace) {
      try {
        await rm(uploadDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    await mkdir(uploadDir, { recursive: true });

    let withImage = 0;
    const stamp = Date.now();

    // Дарааллаар bg remove (VRAM/CPU хэмнэнэ)
    const docs: Array<{ name: string; title: string; image: string }> = [];

    for (const row of rows) {
      let image = NO_PHOTO;

      if (row.imageBuffer && row.imageBuffer.length > 0) {
        try {
          const cutout = await removeImageBackground(row.imageBuffer);
          const filename = `${stamp}-${row.index}.png`;
          await writeFile(path.join(uploadDir, filename), cutout);
          image = `/uploads/wrestlers/${filename}`;
          withImage += 1;
        } catch (err) {
          console.error(`BG remove failed for row ${row.index}:`, err);
          // bg remove амжилтгүй бол тунгалаг бус хадгалахгүй — no-photo
        }
      }

      docs.push({
        name: row.name,
        title: row.title,
        image,
      });
    }

    const created = await Wrestler.insertMany(docs);
    const missing = created.length - withImage;

    return NextResponse.json({
      message:
        missing > 0
          ? `${created.length} бөх импортлогдлоо. ${withImage} зураг (bg хассан), ${missing} зураггүй.`
          : `${created.length} бөх Excel зурагтай импортлогдлоо (арын bg хассан)`,
      count: created.length,
      withImage,
      missing,
    });
  } catch (error) {
    console.error("POST /api/wrestlers/import error:", error);
    return NextResponse.json(
      { error: "Excel импорт хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
