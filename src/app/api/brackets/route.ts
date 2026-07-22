import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Bracket, createEmptyBracketMatches } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const brackets = await Bracket.find()
      .populate("champion", "name title image")
      .sort({ createdAt: -1 });
    return NextResponse.json(brackets);
  } catch (error) {
    console.error("GET /api/brackets error:", error);
    return NextResponse.json(
      { error: "Bracket ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Bracket нэр оруулна уу" },
        { status: 400 }
      );
    }

    const bracket = await Bracket.create({
      name: name.trim(),
      status: "draft",
      matches: createEmptyBracketMatches(),
      champion: null,
    });

    return NextResponse.json(bracket, { status: 201 });
  } catch (error) {
    console.error("POST /api/brackets error:", error);
    return NextResponse.json(
      { error: "Bracket үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
