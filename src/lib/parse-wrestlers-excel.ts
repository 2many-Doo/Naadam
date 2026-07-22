import * as XLSX from "xlsx";
import JSZip from "jszip";

export type ExcelWrestlerRow = {
  index: number;
  name: string;
  title: string;
  imageBuffer?: Buffer;
  imageExt?: string;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function looksLikeHeader(row: unknown[]): boolean {
  const joined = row.map(cellText).join(" ").toLowerCase();
  return (
    joined.includes("цол") ||
    joined.includes("нэр") ||
    joined.includes("овог") ||
    joined.includes("зураг") ||
    joined.includes("name") ||
    joined.includes("title") ||
    joined.includes("image")
  );
}

function extFromPath(p: string): string {
  const m = p.toLowerCase().match(/\.([a-z0-9]+)$/);
  const e = m?.[1] || "png";
  if (e === "jpeg") return "jpg";
  return e;
}

/**
 * xlsx zip доторх зургуудыг мөртэй холбоно (E багана / drawing).
 */
async function extractImagesByRow(
  buffer: Buffer
): Promise<Map<number, { buffer: Buffer; ext: string }>> {
  const map = new Map<number, { buffer: Buffer; ext: string }>();

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return map; // .xls эсвэл zip биш
  }

  const mediaBuffers = new Map<string, Buffer>();
  for (const name of Object.keys(zip.files)) {
    if (!name.startsWith("xl/media/") || zip.files[name].dir) continue;
    const data = await zip.files[name].async("nodebuffer");
    // normalize path key: media/image1.png
    const key = name.replace(/^xl\//, "");
    mediaBuffers.set(key, data);
    mediaBuffers.set(name, data);
  }

  if (mediaBuffers.size === 0) return map;

  const drawingXmlNames = Object.keys(zip.files).filter((n) =>
    /xl\/drawings\/drawing[^/]*\.xml$/i.test(n)
  );

  for (const drawingPath of drawingXmlNames) {
    const xml = await zip.files[drawingPath].async("string");
    const relsPath = drawingPath.replace(
      /drawing([^/]*\.xml)$/i,
      "_rels/drawing$1.rels"
    );
    // also try drawings/_rels/drawing1.xml.rels
    const relsAlt = drawingPath.replace(
      "xl/drawings/",
      "xl/drawings/_rels/"
    ) + ".rels";
    // standard: xl/drawings/_rels/drawing1.xml.rels
    const base = drawingPath.split("/").pop()!; // drawing1.xml
    const relsStandard = `xl/drawings/_rels/${base}.rels`;

    let relsXml = "";
    for (const p of [relsPath, relsAlt, relsStandard]) {
      if (zip.files[p]) {
        relsXml = await zip.files[p].async("string");
        break;
      }
    }

    const ridToMedia = new Map<string, string>();
    const relMatches = relsXml.matchAll(
      /Id="(rId\d+)"[^>]*Target="([^"]+)"/gi
    );
    for (const m of relMatches) {
      let target = m[2].replace(/^\.\.\//, "xl/"); // ../media/image1.png -> xl/media/image1.png
      if (target.startsWith("media/")) target = `xl/${target}`;
      ridToMedia.set(m[1], target);
    }

    // twoCellAnchor / oneCellAnchor blocks
    const anchors = xml.split(/<\/xdr:(?:twoCell|oneCell)Anchor>/i);
    for (const block of anchors) {
      const rowMatch = block.match(/<xdr:row>(\d+)<\/xdr:row>/i);
      const embedMatch =
        block.match(/r:embed="(rId\d+)"/i) ||
        block.match(/r:link="(rId\d+)"/i);
      if (!rowMatch || !embedMatch) continue;

      const row = Number(rowMatch[1]); // 0-based in OOXML
      const mediaPath = ridToMedia.get(embedMatch[1]);
      if (!mediaPath) continue;

      const imgBuf =
        mediaBuffers.get(mediaPath) ||
        mediaBuffers.get(mediaPath.replace(/^xl\//, "")) ||
        mediaBuffers.get(`xl/media/${mediaPath.split("/").pop()}`);

      if (!imgBuf) continue;
      map.set(row, {
        buffer: imgBuf,
        ext: extFromPath(mediaPath),
      });
    }
  }

  // Drawing олдохгүй бол media файлуудыг дарааллаар 0..n мөртэй холбоно
  if (map.size === 0) {
    const ordered = Object.keys(zip.files)
      .filter((n) => n.startsWith("xl/media/") && !zip.files[n].dir)
      .sort();
    for (let i = 0; i < ordered.length; i++) {
      const data = await zip.files[ordered[i]].async("nodebuffer");
      map.set(i, { buffer: data, ext: extFromPath(ordered[i]) });
    }
  }

  return map;
}

/**
 * Excel формат:
 * A: № | B: Овог | C: Нэр | D: Цол | E: Зураг (embedded, optional)
 */
export async function parseWrestlersFromExcel(
  buffer: Buffer
): Promise<ExcelWrestlerRow[]> {
  if (!buffer?.length) {
    throw new Error("Файл хоосон байна");
  }

  // ZIP signature (xlsx) эсвэл OLE (xls)
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // PK
  if (!isZip) {
    throw new Error(
      "Зөвхөн .xlsx файл дэмжинэ (хуучин .xls биш). Excel-ээс .xlsx болгож хадгална уу."
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

  const imagesByRow = await extractImagesByRow(buffer);

  const result: ExcelWrestlerRow[] = [];
  let started = false;
  let dataRowIndex = 0; // 0-based among data rows (for fallback image order)

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

    const index = Number(colA);
    const name = [colB, colC].filter(Boolean).join(" ").trim();
    const title = colD;

    if (!name && !title) continue;
    if (!name || !title) {
      throw new Error(
        `Мөр ${colA || i + 1}: нэр болон цол хоёулаа байх ёстой (одоо: "${name}" / "${title}")`
      );
    }

    // OOXML row index = spreadsheet row - 1 (0-based). SheetJS i is 0-based including skipped header.
    const excelRow0 = i;
    const image =
      imagesByRow.get(excelRow0) ??
      imagesByRow.get(dataRowIndex) ??
      imagesByRow.get(Number.isFinite(index) ? index - 1 : -1);

    result.push({
      index: Number.isFinite(index) ? index : result.length + 1,
      name,
      title,
      imageBuffer: image?.buffer,
      imageExt: image?.ext,
    });
    dataRowIndex += 1;
  }

  if (result.length === 0) {
    throw new Error(
      "Бөх олдсонгүй. Формат: A=№, B=Овог, C=Нэр, D=Цол, E=Зураг"
    );
  }

  result.sort((a, b) => a.index - b.index);
  return result;
}
