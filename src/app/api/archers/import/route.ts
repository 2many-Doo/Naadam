import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Archer } from "@/models";
import { parseArchersFromExcel } from "@/lib/parse-archers-excel";

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
      rows = parseArchersFromExcel(buffer);
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
      await Archer.deleteMany({});
    }

    const docs = rows.map((r) => ({
      name: r.name,
      surname: r.surname,
      team: r.team || "",
      order: r.index,
    }));

    const created = await Archer.insertMany(docs, { ordered: true });

    const sample = created[0];
    if (!sample?.surname) {
      return NextResponse.json(
        {
          error:
            "Өгөгдөл бүрэн хадгалагдаагүй. Dev server-ээ restart хийгээд дахин оруулна уу.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${created.length} харваач амжилттай орууллаа`,
      count: created.length,
      sample: {
        name: sample.name,
        surname: sample.surname,
        team: sample.team,
      },
    });
  } catch (error) {
    console.error("POST /api/archers/import error:", error);
    const message =
      error instanceof Error ? error.message : "Excel импорт хийхэд алдаа гарлаа";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
