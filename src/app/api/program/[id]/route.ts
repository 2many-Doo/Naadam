import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProgramItem } from "@/models";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const item = await ProgramItem.findByIdAndUpdate(
      id,
      {
        ...(body.time != null ? { time: String(body.time).trim() } : {}),
        ...(body.title != null ? { title: String(body.title).trim() } : {}),
        ...(body.category != null
          ? { category: String(body.category).trim() }
          : {}),
        ...(body.location != null
          ? { location: String(body.location).trim() }
          : {}),
        ...(body.owner != null ? { owner: String(body.owner).trim() } : {}),
        ...(body.detail != null ? { detail: String(body.detail).trim() } : {}),
        ...(body.status != null ? { status: String(body.status).trim() } : {}),
        ...(body.order != null ? { order: Number(body.order) } : {}),
      },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH /api/program/[id] error:", error);
    return NextResponse.json(
      { error: "Засахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await ProgramItem.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/program/[id] error:", error);
    return NextResponse.json(
      { error: "Устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
