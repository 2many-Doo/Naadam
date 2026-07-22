import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProgramItem, ProgramMeta } from "@/models";

async function getMeta() {
  return ProgramMeta.findOne().sort({ createdAt: -1 });
}

function normalizeMeta(meta: {
  eventDate: string;
  endDate?: string;
  duration?: string;
}) {
  const endDate = meta.endDate || meta.eventDate;
  return {
    eventDate: meta.eventDate,
    endDate,
  };
}

function mapItem(item: {
  time?: string;
  title?: string;
  category?: string;
  location?: string;
  owner?: string;
  detail?: string;
  status?: string;
  order: number;
}) {
  return {
    time: String(item.time ?? "").trim(),
    title: String(item.title ?? "").trim(),
    category: String(item.category ?? "").trim(),
    location: String(item.location ?? "").trim(),
    owner: String(item.owner ?? "").trim(),
    detail: String(item.detail ?? "").trim(),
    status: String(item.status ?? "").trim() || "Төлөвлөсөн",
    order: item.order,
  };
}

export async function GET() {
  try {
    await connectDB();
    const metaDoc = await getMeta();
    const meta = metaDoc
      ? {
          _id: metaDoc._id,
          ...normalizeMeta(metaDoc),
        }
      : null;
    const items = meta
      ? await ProgramItem.find().sort({ order: 1, time: 1 })
      : [];

    return NextResponse.json({ meta, items });
  } catch (error) {
    console.error("GET /api/program error:", error);
    return NextResponse.json(
      { error: "Хөтөлбөр ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (body.action === "set_meta") {
      const eventDate = String(body.eventDate ?? "").trim();
      const endDate = String(body.endDate ?? body.eventDate ?? "").trim();

      if (!eventDate || !endDate) {
        return NextResponse.json(
          { error: "Өдөр шаардлагатай" },
          { status: 400 }
        );
      }

      if (endDate < eventDate) {
        return NextResponse.json(
          { error: "Дуусах өдөр эхлэх өдрөөс өмнө байж болохгүй" },
          { status: 400 }
        );
      }

      let meta = await getMeta();
      if (meta) {
        meta.eventDate = eventDate;
        meta.endDate = endDate;
        meta.duration = undefined;
        await meta.save();
      } else {
        meta = await ProgramMeta.create({ eventDate, endDate });
      }

      return NextResponse.json({
        meta: {
          _id: meta._id,
          eventDate: meta.eventDate,
          endDate: meta.endDate,
        },
      });
    }

    return NextResponse.json({ error: "Үл мэдэгдэх action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/program error:", error);
    return NextResponse.json(
      { error: "Хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const meta = await getMeta();
    if (!meta) {
      return NextResponse.json(
        { error: "Эхлээд өдөр оруулна уу" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : null;
    if (!items) {
      return NextResponse.json(
        { error: "items массив шаардлагатай" },
        { status: 400 }
      );
    }

    await ProgramItem.deleteMany({});
    const created = await ProgramItem.insertMany(
      items.map((item: Record<string, unknown>, order: number) =>
        mapItem({ ...item, order } as Parameters<typeof mapItem>[0])
      )
    );

    return NextResponse.json({
      count: created.length,
      items: created,
      meta: normalizeMeta(meta),
    });
  } catch (error) {
    console.error("PUT /api/program error:", error);
    return NextResponse.json(
      { error: "Хөтөлбөр хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
