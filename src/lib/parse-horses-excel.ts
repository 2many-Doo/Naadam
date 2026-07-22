import * as XLSX from "xlsx";

export type ExcelHorseRow = {
  index: number;
  name: string; // зүсээр
  color: string;
  team: string;
  rider: string;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function looksLikeHeader(row: unknown[]): boolean {
  const joined = row.map(cellText).join(" ").toLowerCase();
  return (
    joined.includes("морины нэр") ||
    joined.includes("унаач") ||
    joined.includes("зүс") ||
    (joined.includes("баг") && joined.includes("нас")) ||
    (joined.includes("баг") && joined.includes("унаач"))
  );
}

/**
 * Excel формат:
 * A: № | B: Зүс | C: Баг | D: Унаач
 *
 * Хуучин 6 багана ч уншина (нэр, нас алгасана):
 * A: № | B: Морины нэр | C: Зүс | D: Баг | E: Унаач | F: Нас
 */
export function parseHorsesFromExcel(buffer: Buffer): ExcelHorseRow[] {
  if (!buffer?.length) {
    throw new Error("Файл хоосон байна");
  }

  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (!isZip) {
    throw new Error(
      "Зөвхөн .xlsx файл дэмжинэ. Excel-ээс .xlsx болгож хадгална уу."
    );
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: false,
      raw: false,
    });
  } catch {
    throw new Error("Excel файл гэмтсэн эсвэл уншигдахгүй байна");
  }

  const sheetName = workbook.SheetNames?.[0];
  if (!sheetName || !workbook.Sheets?.[sheetName]) {
    throw new Error("Excel файлд хүснэгт олдсонгүй");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const result: ExcelHorseRow[] = [];
  let started = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    if (!started) {
      if (looksLikeHeader(row)) continue;
      started = true;
    }

    const colA = cellText(row[0]);
    const colB = cellText(row[1]);
    const colC = cellText(row[2]);
    const colD = cellText(row[3]);
    const colE = cellText(row[4]);
    const colF = cellText(row[5]);

    if (!colA && !colB && !colC && !colD) continue;

    const index = Number(colA);

    // Хуучин: № нэр зүс баг унаач нас — F байвал 6 багана
    const legacy6 = Boolean(colE || colF);
    const color = legacy6 ? colC || colB : colB;
    const team = legacy6 ? colD : colC;
    const rider = legacy6 ? colE : colD;

    if (!color) {
      throw new Error(`Мөр ${colA || i + 1}: зүс байх ёстой`);
    }

    result.push({
      index: Number.isFinite(index) ? index : result.length + 1,
      name: color,
      color,
      team,
      rider,
    });
  }

  if (result.length === 0) {
    throw new Error(
      "Морь олдсонгүй. Формат: A=№, B=Зүс, C=Баг, D=Унаач"
    );
  }

  result.sort((a, b) => a.index - b.index);
  return result;
}
