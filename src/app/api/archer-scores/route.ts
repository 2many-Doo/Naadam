import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Archer, ArcherScore } from "@/models";

function isValidArrows(arrows: unknown): arrows is boolean[] {
  return (
    Array.isArray(arrows) &&
    arrows.length === 3 &&
    arrows.every((a) => typeof a === "boolean")
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const archerId = request.nextUrl.searchParams.get("archerId");
    const filter = archerId ? { archer: archerId } : {};
    const scores = await ArcherScore.find(filter)
      .populate("archer")
      .sort({ updatedAt: -1 });
    return NextResponse.json(scores);
  } catch (error) {
    console.error("GET /api/archer-scores error:", error);
    return NextResponse.json(
      { error: "Оноо ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const archerId = String(body.archerId ?? "").trim();
    const arrows = body.arrows;

    if (!archerId) {
      return NextResponse.json(
        { error: "Харваач сонгоно уу" },
        { status: 400 }
      );
    }
    if (!isValidArrows(arrows)) {
      return NextResponse.json(
        { error: "3 сумны оносон/оноогүй шаардлагатай" },
        { status: 400 }
      );
    }

    const archer = await Archer.findById(archerId);
    if (!archer) {
      return NextResponse.json(
        { error: "Харваач олдсонгүй" },
        { status: 404 }
      );
    }

    const hits = arrows.filter(Boolean).length;
    const misses = 3 - hits;

    const score = await ArcherScore.findOneAndUpdate(
      { archer: archerId },
      { archer: archerId, arrows, hits, misses },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("archer");

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error("POST /api/archer-scores error:", error);
    return NextResponse.json(
      { error: "Оноо хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
