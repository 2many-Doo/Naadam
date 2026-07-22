import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProgramItem, ProgramMeta } from "@/models";
import { parseProgramFromExcel } from "@/lib/parse-program-excel";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const meta = await ProgramMeta.findOne().sort({ createdAt: -1 });
    if (!meta) {
      return NextResponse.json(
        { error: "Эхлээд баярын өдөр оруулна уу" },
        { status: 400 }
      );
    }

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
        { error: ".xlsx файл ашиглана уу" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows;
    try {
      rows = parseProgramFromExcel(buffer);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Excel уншихад алдаа гарлаа";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await ProgramItem.deleteMany({});
    const created = await ProgramItem.insertMany(
      rows.map((r, order) => ({
        time: r.time,
        title: r.title,
        category: r.category,
        location: r.location,
        owner: r.owner,
        detail: r.detail,
        status: r.status,
        order: r.index || order + 1,
      }))
    );

    return NextResponse.json({
      message: `${created.length} мөр амжилттай орууллаа`,
      count: created.length,
    });
  } catch (error) {
    console.error("POST /api/program/import error:", error);
    return NextResponse.json(
      { error: "Excel импорт хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
