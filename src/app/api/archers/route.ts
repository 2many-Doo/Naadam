import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Archer } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const archers = await Archer.find()
      .sort({ order: 1, name: 1 })
      .lean();
    return NextResponse.json(archers);
  } catch (error) {
    console.error("GET /api/archers error:", error);
    return NextResponse.json(
      { error: "Харваачдыг ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const archer = await Archer.create(body);
    return NextResponse.json(archer, { status: 201 });
  } catch (error) {
    console.error("POST /api/archers error:", error);
    return NextResponse.json(
      { error: "Харваач нэмэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
