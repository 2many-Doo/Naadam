export interface Wrestler {
  _id: string;
  name: string;
  title: string;
  image: string;
  province?: string;
}

export interface Archer {
  _id: string;
  name: string;
  surname: string;
  team: string;
  order: number;
}

export interface Horse {
  _id: string;
  name: string;
  color: string;
  team: string;
  rider: string;
  place: number | null;
  order: number;
}

/** 3 сум: true = оносон, false = оноогүй */
export interface ArcherScore {
  _id: string;
  archer: string | Archer;
  arrows: boolean[];
  hits: number;
  misses: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Match {
  _id: string;
  round: number;
  position: number;
  wrestler1: Wrestler | null;
  wrestler2: Wrestler | null;
  winner: Wrestler | null;
  status: "pending" | "completed";
}

export interface Bracket {
  _id: string;
  name: string;
  status: "draft" | "active" | "completed";
  matches: Match[];
  champion: Wrestler | null;
  createdAt: string;
  updatedAt: string;
}
