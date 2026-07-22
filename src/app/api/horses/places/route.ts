import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Horse } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const placements = Array.isArray(body.placements) ? body.placements : null;

    if (!placements) {
      return NextResponse.json(
        { error: "placements массив шаардлагатай" },
        { status: 400 }
      );
    }

    const horses = await Horse.find();
    if (horses.length === 0) {
      return NextResponse.json({ error: "Морь байхгүй" }, { status: 400 });
    }

    type Row = { horseId: string; place: number };
    const rows: Row[] = placements.map(
      (p: { horseId?: string; place?: number }) => ({
        horseId: String(p.horseId ?? "").trim(),
        place: Number(p.place),
      })
    );

    if (rows.length !== horses.length) {
      return NextResponse.json(
        { error: `Бүх ${horses.length} моринд байр өгнө үү` },
        { status: 400 }
      );
    }

    const ids = new Set(rows.map((r) => r.horseId));
    const places = new Set(rows.map((r) => r.place));

    if (ids.size !== rows.length) {
      return NextResponse.json(
        { error: "Нэг морийг нэг л байранд оруулна" },
        { status: 400 }
      );
    }
    if (places.size !== rows.length) {
      return NextResponse.json(
        { error: "Байр давхардаж болохгүй" },
        { status: 400 }
      );
    }

    for (const r of rows) {
      if (!Number.isInteger(r.place) || r.place < 1 || r.place > horses.length) {
        return NextResponse.json(
          { error: `Байр 1–${horses.length} хооронд байх ёстой` },
          { status: 400 }
        );
      }
      const exists = horses.some((h) => String(h._id) === r.horseId);
      if (!exists) {
        return NextResponse.json(
          { error: "Морины ID буруу байна" },
          { status: 400 }
        );
      }
    }

    await Promise.all(
      rows.map((r) =>
        Horse.findByIdAndUpdate(r.horseId, { place: r.place })
      )
    );

    const updated = await Horse.find().sort({ place: 1, order: 1 });
    return NextResponse.json({
      message: "Байр амжилттай хадгалагдлаа",
      horses: updated,
    });
  } catch (error) {
    console.error("POST /api/horses/places error:", error);
    return NextResponse.json(
      { error: "Байр хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
