import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wrestler } from "@/models";

/** Тест бөх үүсгэх — зураггүй (Excel-ээр зураг оруулна) */
export async function POST() {
  try {
    await connectDB();

    const count = await Wrestler.countDocuments();
    if (count >= 64) {
      return NextResponse.json({
        message: `${count} бөх аль хэдийн байна. Зурагтай шинэчлэх бол Excel импорт ашиглана.`,
        count,
      });
    }

    const titles = [
      "Заан",
      "Гарьд",
      "Арслан",
      "Аварга",
      "Хонгор",
      "Бөх",
      "Начин",
      "Харцага",
    ];

    const provinces = [
      "Архангай",
      "Баян-Өлгий",
      "Баянхонгор",
      "Булган",
      "Говь-Алтай",
      "Дорноговь",
      "Дорнод",
      "Дундговь",
      "Завхан",
      "Орхон",
      "Өвөрхангай",
      "Өмнөговь",
      "Сүхбаатар",
      "Сэлэнгэ",
      "Төв",
      "Увс",
      "Ховд",
      "Хөвсгөл",
      "Хэнтий",
      "Дархан-Уул",
    ];

    const firstNames = [
      "Бат",
      "Bold",
      "Gan",
      "Tuv",
      "Enk",
      "Munkh",
      "Naran",
      "Och",
      "Purev",
      "Sukh",
      "Tseren",
      "Uugan",
      "Zorig",
      "Davaa",
      "Erdene",
      "Gantulga",
    ];

    const lastNames = [
      "Batbold",
      "Ganbold",
      "Tuvshin",
      "Enkhbold",
      "Munkhbat",
      "Naranbaatar",
      "Ochirbat",
      "Purevdorj",
      "Sukhbaatar",
      "Tserendorj",
      "Uuganbaatar",
      "Zorigt",
      "Davaajav",
      "Erdenebat",
      "Gantumur",
      "Bayarsaikhan",
    ];

    const wrestlers = [];
    for (let i = 0; i < 64; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[Math.floor(i / 4) % lastNames.length];
      wrestlers.push({
        name: `${fn}${ln}`,
        title: titles[i % titles.length],
        province: provinces[i % provinces.length],
        image: "/no-photo.svg",
      });
    }

    await Wrestler.deleteMany({});
    const created = await Wrestler.insertMany(wrestlers);

    return NextResponse.json({
      message: `${created.length} тест бөх үүслээ (зураггүй). Excel-ээр зурагтай импортлоно уу.`,
      count: created.length,
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { error: "Seed хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
