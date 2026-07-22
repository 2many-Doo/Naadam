import { Bracket, Match, Wrestler } from "@/types";
import { TOTAL_ROUNDS } from "@/lib/constants";

export type BracketPhase =
  | { mode: "setup"; round: number }
  | { mode: "play"; round: number }
  | { mode: "completed" };

export function getMatchesForRound(bracket: Bracket, round: number): Match[] {
  return bracket.matches
    .filter((m) => m.round === round)
    .sort((a, b) => a.position - b.position);
}

export function isRoundPaired(matches: Match[]): boolean {
  return (
    matches.length > 0 &&
    matches.every((m) => m.wrestler1 !== null && m.wrestler2 !== null)
  );
}

export function isRoundComplete(matches: Match[]): boolean {
  return (
    matches.length > 0 &&
    matches.every((m) => m.status === "completed" && m.winner !== null)
  );
}

export function getRoundWinners(matches: Match[]): Wrestler[] {
  return matches
    .filter((m) => m.winner)
    .map((m) => m.winner!)
    .sort((a, b) => a.name.localeCompare(b.name, "mn"));
}

/** Одоогийн UI төлөв: барилдаан тааруулах / барилдах / дууссан */
export function getBracketPhase(bracket: Bracket): BracketPhase {
  if (bracket.status === "completed" || bracket.champion) {
    return { mode: "completed" };
  }

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    const matches = getMatchesForRound(bracket, round);

    if (!isRoundPaired(matches)) {
      return { mode: "setup", round };
    }

    if (!isRoundComplete(matches)) {
      return { mode: "play", round };
    }
  }

  return { mode: "completed" };
}
