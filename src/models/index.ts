import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWrestler extends Document {
  name: string;
  title: string;
  image: string;
  province?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WrestlerSchema = new Schema<IWrestler>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    province: { type: String },
  },
  { timestamps: true }
);

export const Wrestler =
  mongoose.models.Wrestler ||
  mongoose.model<IWrestler>("Wrestler", WrestlerSchema);

export type MatchStatus = "pending" | "completed";

export interface IMatch {
  _id?: Types.ObjectId;
  round: number;
  position: number;
  wrestler1: Types.ObjectId | null;
  wrestler2: Types.ObjectId | null;
  winner: Types.ObjectId | null;
  status: MatchStatus;
}

export interface IBracket extends Document {
  name: string;
  status: "draft" | "active" | "completed";
  matches: IMatch[];
  champion: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    round: { type: Number, required: true },
    position: { type: Number, required: true },
    wrestler1: { type: Schema.Types.ObjectId, ref: "Wrestler", default: null },
    wrestler2: { type: Schema.Types.ObjectId, ref: "Wrestler", default: null },
    winner: { type: Schema.Types.ObjectId, ref: "Wrestler", default: null },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { _id: true }
);

const BracketSchema = new Schema<IBracket>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },
    matches: [MatchSchema],
    champion: { type: Schema.Types.ObjectId, ref: "Wrestler", default: null },
  },
  { timestamps: true }
);

export const Bracket =
  mongoose.models.Bracket ||
  mongoose.model<IBracket>("Bracket", BracketSchema);

export interface IProgramItem extends Document {
  time: string; // Цаг
  title: string; // Арга хэмжээ
  category: string; // Төрөл
  location: string; // Байршил
  owner: string; // Хариуцах хүн / баг
  detail: string; // Тайлбар
  status: string; // Төлөв
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramItemSchema = new Schema<IProgramItem>(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: "" },
    location: { type: String, default: "" },
    owner: { type: String, default: "" },
    detail: { type: String, default: "" },
    status: { type: String, default: "Төлөвлөсөн" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

if (mongoose.models.ProgramItem) {
  delete mongoose.models.ProgramItem;
}

export const ProgramItem = mongoose.model<IProgramItem>(
  "ProgramItem",
  ProgramItemSchema
);

/** Баярын өдөр / хугацаа (эхлэх–дуусах) */
export interface IProgramMeta extends Document {
  eventDate: string; // YYYY-MM-DD эхлэх
  endDate: string; // YYYY-MM-DD дуусах
  /** @deprecated хуучин текст хугацаа — шинэ бичлэгт ашиглахгүй */
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramMetaSchema = new Schema<IProgramMeta>(
  {
    eventDate: { type: String, required: true },
    endDate: { type: String, required: true },
    duration: { type: String },
  },
  { timestamps: true }
);

export const ProgramMeta =
  mongoose.models.ProgramMeta ||
  mongoose.model<IProgramMeta>("ProgramMeta", ProgramMetaSchema);

/** Сур харваачид */
export interface IArcher extends Document {
  name: string; // Нэр
  surname: string; // Овог
  team: string; // Баг
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArcherSchema = new Schema<IArcher>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    team: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

// Hot-reload үед хуучин schema үлдэхгүй
if (mongoose.models.Archer) {
  delete mongoose.models.Archer;
}

export const Archer = mongoose.model<IArcher>("Archer", ArcherSchema);

/** Хурдан морь — зүсээр нэрлэнэ */
export interface IHorse extends Document {
  name: string; // зүс (харуулах нэр)
  color: string; // Зүс
  team: string; // Баг
  rider: string; // Унаач
  place: number | null; // Уралдааны байр (1 = түрүү)
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const HorseSchema = new Schema<IHorse>(
  {
    name: { type: String, required: true },
    color: { type: String, default: "" },
    team: { type: String, default: "" },
    rider: { type: String, default: "" },
    place: { type: Number, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

if (mongoose.models.Horse) {
  delete mongoose.models.Horse;
}

export const Horse = mongoose.model<IHorse>("Horse", HorseSchema);

/** Сур харвааны оноо: 3 сум (true=оносон, false=оноогүй) */
export interface IArcherScore extends Document {
  archer: Types.ObjectId;
  /** [сум1, сум2, сум3] */
  arrows: boolean[];
  hits: number;
  misses: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArcherScoreSchema = new Schema<IArcherScore>(
  {
    archer: {
      type: Schema.Types.ObjectId,
      ref: "Archer",
      required: true,
      unique: true,
    },
    arrows: {
      type: [Boolean],
      required: true,
      validate: {
        validator(v: boolean[]) {
          return Array.isArray(v) && v.length === 3;
        },
        message: "3 сум байх ёстой",
      },
    },
    hits: { type: Number, required: true, default: 0 },
    misses: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.ArcherScore) {
  delete mongoose.models.ArcherScore;
}

export const ArcherScore = mongoose.model<IArcherScore>(
  "ArcherScore",
  ArcherScoreSchema
);

export function createEmptyBracketMatches(): IMatch[] {
  const matches: IMatch[] = [];
  let round = 1;
  let count = 32;

  while (count >= 1) {
    for (let position = 0; position < count; position++) {
      matches.push({
        round,
        position,
        wrestler1: null,
        wrestler2: null,
        winner: null,
        status: "pending",
      });
    }
    count = count / 2;
    round++;
  }

  return matches;
}
