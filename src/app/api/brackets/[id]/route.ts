import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Bracket, IMatch } from "@/models";
import {
  ROUND_MATCH_COUNTS,
  TOTAL_ROUNDS,
} from "@/lib/constants";

type RouteParams = { params: Promise<{ id: string }> };

const POPULATE = [
  { path: "matches.wrestler1", select: "name title image province" },
  { path: "matches.wrestler2", select: "name title image province" },
  { path: "matches.winner", select: "name title image province" },
  { path: "champion", select: "name title image province" },
];

function getWinnerIds(matches: IMatch[], round: number): Set<string> {
  return new Set(
    matches
      .filter((m) => m.round === round && m.winner)
      .map((m) => m.winner!.toString())
  );
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const bracket = await Bracket.findById(id).populate(POPULATE);

    if (!bracket) {
      return NextResponse.json(
        { error: "Bracket олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json(bracket);
  } catch (error) {
    console.error("GET /api/brackets/[id] error:", error);
    return NextResponse.json(
      { error: "Bracket ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const bracket = await Bracket.findById(id);
    if (!bracket) {
      return NextResponse.json(
        { error: "Bracket олдсонгүй" },
        { status: 404 }
      );
    }

    // Давааны барилдааныг гараар оноох
    if (body.action === "set_round" || body.action === "set_first_round") {
      const round: number =
        body.action === "set_first_round" ? 1 : Number(body.round);
      const { pairings } = body as {
        pairings: Array<{
          position: number;
          wrestler1Id: string;
          wrestler2Id: string;
        }>;
      };

      const expectedCount = ROUND_MATCH_COUNTS[round];
      if (!expectedCount || !pairings || pairings.length !== expectedCount) {
        return NextResponse.json(
          { error: `${expectedCount} барилдаан оруулах шаардлагатай` },
          { status: 400 }
        );
      }

      if (round > 1) {
        const prevMatches = bracket.matches.filter(
          (m: IMatch) => m.round === round - 1
        );
        const allPrevDone = prevMatches.every(
          (m: IMatch) => m.status === "completed" && m.winner
        );
        if (!allPrevDone) {
          return NextResponse.json(
            { error: "Өмнөх даваа бүрэн дуусаагүй байна" },
            { status: 400 }
          );
        }

        const allowed = getWinnerIds(bracket.matches, round - 1);
        for (const p of pairings) {
          if (!allowed.has(p.wrestler1Id) || !allowed.has(p.wrestler2Id)) {
            return NextResponse.json(
              { error: "Зөвхөн өмнөх давааны давсан бөхүүдийг онооно" },
              { status: 400 }
            );
          }
        }
      }

      const usedIds = new Set<string>();
      for (const p of pairings) {
        if (usedIds.has(p.wrestler1Id) || usedIds.has(p.wrestler2Id)) {
          return NextResponse.json(
            { error: "Нэг бөх хоёр барилдаанд орж болохгүй" },
            { status: 400 }
          );
        }
        if (p.wrestler1Id === p.wrestler2Id) {
          return NextResponse.json(
            { error: "Нэг барилдаанд ижил бөх байж болохгүй" },
            { status: 400 }
          );
        }
        usedIds.add(p.wrestler1Id);
        usedIds.add(p.wrestler2Id);
      }

      for (const p of pairings) {
        const match = bracket.matches.find(
          (m: IMatch) => m.round === round && m.position === p.position
        );
        if (match) {
          match.wrestler1 = new mongoose.Types.ObjectId(p.wrestler1Id);
          match.wrestler2 = new mongoose.Types.ObjectId(p.wrestler2Id);
          match.winner = null;
          match.status = "pending";
        }
      }

      // Ирээдүйн даваануудыг цэвэрлэх (хуучин автомат оноолт байсан бол)
      for (const m of bracket.matches) {
        if (m.round > round) {
          m.wrestler1 = null;
          m.wrestler2 = null;
          m.winner = null;
          m.status = "pending";
        }
      }

      bracket.champion = null;
      bracket.status = "active";
      bracket.markModified("matches");
      await bracket.save();

      const populated = await Bracket.findById(id).populate(POPULATE);
      return NextResponse.json(populated);
    }

    // Ялагч тэмдэглэх — дараагийн даваанд автоматаар оруулахгүй
    if (body.action === "set_winner") {
      const { matchId, winnerId } = body as {
        matchId: string;
        winnerId: string;
      };

      const matchIndex = bracket.matches.findIndex(
        (m: IMatch) => m._id?.toString() === matchId
      );

      if (matchIndex === -1) {
        return NextResponse.json(
          { error: "Барилдаан олдсонгүй" },
          { status: 404 }
        );
      }

      const match = bracket.matches[matchIndex];

      if (!match.wrestler1 || !match.wrestler2) {
        return NextResponse.json(
          { error: "Бөх сонгогдоогүй барилдаан" },
          { status: 400 }
        );
      }

      const w1 = match.wrestler1.toString();
      const w2 = match.wrestler2.toString();
      if (winnerId !== w1 && winnerId !== w2) {
        return NextResponse.json(
          { error: "Ялагч энэ барилдааны бөх биш" },
          { status: 400 }
        );
      }

      match.winner = new mongoose.Types.ObjectId(winnerId);
      match.status = "completed";

      // Финал дууссан бол аварга
      if (match.round === TOTAL_ROUNDS) {
        bracket.champion = new mongoose.Types.ObjectId(winnerId);
        bracket.status = "completed";
      }

      bracket.markModified("matches");
      await bracket.save();

      const populated = await Bracket.findById(id).populate(POPULATE);
      return NextResponse.json(populated);
    }

    return NextResponse.json({ error: "Буруу action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/brackets/[id] error:", error);
    return NextResponse.json(
      { error: "Bracket шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    await Bracket.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/brackets/[id] error:", error);
    return NextResponse.json(
      { error: "Bracket устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
