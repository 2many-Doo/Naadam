import * as XLSX from "xlsx";

export type ExcelArcherRow = {
  index: number;
  name: string;
  surname: string;
  team: string;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function looksLikeHeader(row: unknown[]): boolean {
  const joined = row.map(cellText).join(" ").toLowerCase();
  return (
    joined.includes("нэр") ||
    joined.includes("овог") ||
    joined.includes("нас") ||
    joined.includes("баг") ||
    joined.includes("name") ||
    joined.includes("age") ||
    joined.includes("team")
  );
}

/**
 * Excel формат:
 * A: № | B: Нэр | C: Овог | D: Баг
 * (хуучин файл: D=Нас, E=Баг — нас-ыг алгасна)
 */
export function parseArchersFromExcel(buffer: Buffer): ExcelArcherRow[] {
  if (!buffer?.length) {
    throw new Error("Файл хоосон байна");
  }

  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // PK (.xlsx)
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

  const result: ExcelArcherRow[] = [];
  let started = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    if (!started) {
      if (looksLikeHeader(row)) continue;
      started = true;
    }

    const colA = cellText(row[0]);
    const colB = cellText(row[1]); // Нэр
    const colC = cellText(row[2]); // Овог
    const colD = cellText(row[3]);
    const colE = cellText(row[4]);

    if (!colA && !colB && !colC && !colD && !colE) continue;

    const index = Number(colA);
    const name = colB;
    const surname = colC;

    // Хуучин: D=Нас (тоо) + E=Баг → E ашиглана
    // Шинэ: D=Баг
    const legacyWithAge =
      colE !== "" && Number.isFinite(Number(colD)) && Number(colD) > 0;
    const team = legacyWithAge ? colE : colD;

    if (!name || !surname) {
      throw new Error(
        `Мөр ${colA || i + 1}: нэр болон овог хоёулаа байх ёстой`
      );
    }

    result.push({
      index: Number.isFinite(index) ? index : result.length + 1,
      name,
      surname,
      team,
    });
  }

  if (result.length === 0) {
    throw new Error(
      "Харваач олдсонгүй. Формат: A=№, B=Нэр, C=Овог, D=Баг"
    );
  }

  result.sort((a, b) => a.index - b.index);
  return result;
}
