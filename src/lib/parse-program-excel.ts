import * as XLSX from "xlsx";

export type ExcelProgramRow = {
  index: number;
  time: string;
  title: string;
  category: string;
  location: string;
  owner: string;
  detail: string;
  status: string;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

/** Хүснэгтийн толгой: № · Цаг · Арга хэмжээ ... */
function isTableHeader(row: unknown[]): boolean {
  const cells = row.map(cellText).map((c) => c.toLowerCase());
  const hasTime = cells.some((c) => c === "цаг" || c.startsWith("цаг"));
  const hasEvent = cells.some((c) => c.includes("арга хэмжээ"));
  return hasTime && hasEvent;
}

/** Цаг багана: 08:00 эсвэл 08:00–09:00 */
function isTimeValue(value: string): boolean {
  return /\d{1,2}\s*:\s*\d{2}/.test(value);
}

/**
 * Excel формат (дээр нь гарчиг/мета байж болно):
 * A: № | B: Цаг | C: Арга хэмжээ | D: Төрөл | E: Байршил
 * F: Хариуцах хүн/баг | G: Тайлбар | H: Төлөв
 */
export function parseProgramFromExcel(buffer: Buffer): ExcelProgramRow[] {
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

  // Гарчиг/мета мөрүүдийг алгасаад хүснэгтийн толгойг олно
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (Array.isArray(row) && isTableHeader(row)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex < 0) {
    throw new Error(
      "Хүснэгтийн толгой олдсонгүй. «Цаг» болон «Арга хэмжээ» баганатай мөр байх ёстой."
    );
  }

  const result: ExcelProgramRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const colA = cellText(row[0]);
    const colB = cellText(row[1]); // Цаг
    const colC = cellText(row[2]); // Арга хэмжээ
    const colD = cellText(row[3]); // Төрөл
    const colE = cellText(row[4]); // Байршил
    const colF = cellText(row[5]); // Хариуцах
    const colG = cellText(row[6]); // Тайлбар
    const colH = cellText(row[7]); // Төлөв

    // Хоосон / гарчиг / тэмдэглэл мөр
    if (!colA && !colB && !colC) continue;
    if (!isTimeValue(colB) || !colC) continue;

    const index = Number(colA);

    result.push({
      index: Number.isFinite(index) ? index : result.length + 1,
      time: colB.replace(/\s+/g, ""),
      title: colC,
      category: colD,
      location: colE,
      owner: colF,
      detail: colG,
      status: colH || "Төлөвлөсөн",
    });
  }

  if (result.length === 0) {
    throw new Error(
      "Хөтөлбөрийн мөр олдсонгүй. Толгойгоос доош № · Цаг · Арга хэмжээ бүхий мөрүүд байх ёстой."
    );
  }

  result.sort((a, b) => a.index - b.index);
  return result;
}
