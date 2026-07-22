import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Horse } from "@/models";
import { parseHorsesFromExcel } from "@/lib/parse-horses-excel";

export const runtime = "nodejs";

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
        { error: ".xlsx файл ашиглана уу" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows;
    try {
      rows = parseHorsesFromExcel(buffer);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Excel уншихад алдаа гарлаа";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const replace = formData.get("replace") === "true";
    if (replace) {
      await Horse.deleteMany({});
    }

    const created = await Horse.insertMany(
      rows.map((r) => ({
        name: r.color || r.name,
        color: r.color || "",
        team: r.team || "",
        rider: r.rider || "",
        place: null,
        order: r.index,
      }))
    );

    return NextResponse.json({
      message: `${created.length} морь амжилттай орууллаа`,
      count: created.length,
    });
  } catch (error) {
    console.error("POST /api/horses/import error:", error);
    return NextResponse.json(
      { error: "Excel импорт хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
