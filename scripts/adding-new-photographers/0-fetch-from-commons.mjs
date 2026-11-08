#!/usr/bin/env node
import fs from "fs";
import path from "path";

const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT =
  "MosaicPhotographyImporter/1.0 (https://www.mosaic.photography)";

const IMG_ROOT =
  process.platform === "win32"
    ? "C:\\Users\\elcar\\Documents\\WEBs\\Mosaic\\IMGs"
    : "/mnt/c/Users/elcar/Documents/WEBs/Mosaic/IMGs";

const VALID_NUDITY = ["nude", "not-nude"];
const VALID_GENDERS = ["male", "female", "couple", "group", "mixed", "none"];
const VALID_COLORS = ["bw", "sepia", "color"];

function usage() {
  console.log(`Usage:

  Candidates (default):
    node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder <slug> \\
      --category "<Commons category>" [--category "..."] [--file "File:..."] \\
      [--depth 2] [--min-px 1600] [--low-res-floor 900] [--max-year 1930]

  Download kept originals:
    node scripts/adding-new-photographers/0-fetch-from-commons.mjs --folder <slug> \\
      --apply <decisions.json>`);
}

function parseArgs(argv) {
  const opts = {
    folder: "",
    categories: [],
    files: [],
    depth: 2,
    minPx: 1600,
    lowResFloor: 900,
    maxYear: 1930,
    apply: "",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };

    switch (arg) {
      case "--folder":
        opts.folder = next();
        break;
      case "--category":
        opts.categories.push(next());
        break;
      case "--file":
        opts.files.push(next());
        break;
      case "--depth":
        opts.depth = parseInt(next(), 10);
        break;
      case "--min-px":
        opts.minPx = parseInt(next(), 10);
        break;
      case "--low-res-floor":
        opts.lowResFloor = parseInt(next(), 10);
        break;
      case "--max-year":
        opts.maxYear = parseInt(next(), 10);
        break;
      case "--apply":
        opts.apply = next();
        break;
      case "-h":
      case "--help":
        opts.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastRequestAt = 0;

async function throttle() {
  const wait = 200 - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

async function apiQuery(params) {
  const responses = [];
  let cont = null;
  let pages = 0;

  do {
    const url = new URL(API);
    const merged = {
      action: "query",
      format: "json",
      formatversion: "2",
      ...params,
      ...(cont || {}),
    };

    for (const [key, value] of Object.entries(merged)) {
      url.searchParams.set(key, String(value));
    }

    await throttle();
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      throw new Error(`Commons API ${res.status} ${res.statusText}: ${url}`);
    }

    const data = await res.json();
    responses.push(data);
    cont = data.continue || null;
    pages += 1;
    if (pages > 1000) throw new Error("Commons API continue loop too long");
  } while (cont);

  return responses;
}

function normalizeCategory(category) {
  return /^Category:/i.test(category) ? category : `Category:${category}`;
}

function normalizeFileTitle(title) {
  return /^File:/i.test(title) ? title : `File:${title}`;
}

async function collectCategory(category, depth, visited, filesByTitle) {
  const title = normalizeCategory(category);
  if (visited.has(title)) return;
  visited.add(title);

  const responses = await apiQuery({
    list: "categorymembers",
    cmtitle: title,
    cmtype: "file|subcat",
    cmlimit: "max",
  });

  const subcategories = [];

  for (const response of responses) {
    const members = response.query?.categorymembers || [];
    for (const member of members) {
      if (member.ns === 6) {
        if (!filesByTitle.has(member.title)) {
          filesByTitle.set(member.title, {
            title: member.title,
            pageid: member.pageid,
            fromFileArg: false,
          });
        }
      } else if (member.ns === 14) {
        subcategories.push(member.title);
      }
    }
  }

  if (depth > 0) {
    for (const subcategory of subcategories) {
      await collectCategory(subcategory, depth - 1, visited, filesByTitle);
    }
  }
}

function stripHtml(input) {
  if (input === undefined || input === null) return "";
  let text = String(input);
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#0*39;|&apos;/gi, "'");
  text = text.replace(/&#(\d+);/g, (_, n) =>
    String.fromCodePoint(Number(n)),
  );
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, n) =>
    String.fromCodePoint(parseInt(n, 16)),
  );
  return text.replace(/\s+/g, " ").trim();
}

function metaValue(extmetadata, key) {
  const value = extmetadata?.[key]?.value;
  return value === undefined || value === null ? "" : String(value);
}

function findYear(text) {
  if (!text) return null;
  const matches = text.match(/\b(1[89]\d{2})\b/g);
  if (!matches) return null;

  for (const match of matches) {
    const year = parseInt(match, 10);
    if (year >= 1820 && year <= 1999) return year;
  }

  return null;
}

function extensionForMime(mime) {
  switch ((mime || "").toLowerCase()) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/tiff":
      return ".tif";
    default:
      return "";
  }
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".tif") || pathname.endsWith(".tiff")) return ".tif";
  } catch {
    // ignore malformed URLs
  }
  return "";
}

function classifyLicense(license, licenseShortName) {
  const licenseValue = (license || "").toLowerCase().trim();
  const shortValue = (licenseShortName || "").toLowerCase();

  if (licenseValue === "pd" || licenseValue.startsWith("cc0")) {
    return { accepted: true, note: null };
  }

  if (
    shortValue.includes("public domain") ||
    shortValue.includes("cc0") ||
    shortValue.includes("public domain mark")
  ) {
    return { accepted: true, note: null };
  }

  if (
    shortValue.includes("no restrictions") ||
    shortValue.includes("no known copyright restrictions") ||
    shortValue.includes("no known restrictions")
  ) {
    return { accepted: true, note: "no_known_restrictions" };
  }

  return { accepted: false, note: null };
}

function normalizeThumbUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.hostname = "upload.wikimedia.org";
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_")) parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeTitle(title) {
  let text = String(title || "").replace(/^File:/i, "");
  text = text.replace(/\.[a-z0-9]+$/i, "");
  text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  text = text.toLowerCase();
  text = text.replace(/\(cropped\)/g, " ");
  text = text.replace(/\[\d+\]/g, " ");
  text = text.replace(/\b(met|getty|lccn\w*|loc)\b/g, " ");
  text = text.replace(/[^a-z0-9]+/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function plainTitle(objectName, commonsTitle) {
  let text = stripHtml(objectName || "");
  if (!text) {
    text = String(commonsTitle || "")
      .replace(/^File:/i, "")
      .replace(/\.[a-z0-9]+$/i, "");
  }
  return text.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyTitle(title) {
  const slug = String(title || "")
    .replace(/ß/g, "ss")
    .replace(/['’]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

  return slug || "untitled";
}

function orientationFor(width, height) {
  if (!width || !height) return "vertical";
  const ratio = width / height;
  if (ratio >= 0.95 && ratio <= 1.05) return "square";
  return height > width ? "vertical" : "horizontal";
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows) {
  const header = [
    "filename",
    "mosaic_title",
    "commons_title",
    "description_url",
    "original_url",
    "license",
    "credit",
    "artist",
    "date_string",
    "year",
    "nudity",
    "gender",
    "orientation",
    "color",
    "possible_minor",
    "low_res",
    "license_note",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(header.map((key) => csvEscape(row[key])).join(","));
  }

  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (inQuotes) {
      if (character === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0];

  return rows
    .slice(1)
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => {
      const record = {};
      header.forEach((key, index) => {
        record[key] = values[index] ?? "";
      });
      return record;
    });
}

function readSourcesIfExists(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

async function fetchFileRecord(entry, opts) {
  const responses = await apiQuery({
    prop: "imageinfo|categories",
    titles: entry.title,
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "400",
  });

  let page = null;
  for (const response of responses) {
    const pages = response.query?.pages || [];
    const found = pages.find((item) => item.title === entry.title) || pages[0];
    if (found && (!page || (!page.imageinfo && found.imageinfo))) {
      page = found;
    }
  }

  if (!page || page.missing || !page.imageinfo || !page.imageinfo[0]) {
    return {
      pageid: entry.pageid ?? page?.pageid ?? null,
      commons_title: entry.title,
      normalized_title: normalizeTitle(entry.title),
      status: "rejected",
      rejected_reason: "no_imageinfo",
    };
  }

  const info = page.imageinfo[0];
  const extmetadata = info.extmetadata || {};

  const license = stripHtml(metaValue(extmetadata, "License"));
  const licenseShortName = stripHtml(
    metaValue(extmetadata, "LicenseShortName"),
  );
  const dateTimeOriginal = stripHtml(
    metaValue(extmetadata, "DateTimeOriginal"),
  );
  const objectName = stripHtml(metaValue(extmetadata, "ObjectName"));
  const imageDescription = stripHtml(
    metaValue(extmetadata, "ImageDescription"),
  );
  const artist = stripHtml(metaValue(extmetadata, "Artist"));
  const credit = stripHtml(metaValue(extmetadata, "Credit"));
  const licenseInfo = classifyLicense(license, licenseShortName);

  let year = findYear(dateTimeOriginal);
  if (year === null) year = findYear(objectName);

  const record = {
    pageid: page.pageid ?? entry.pageid ?? null,
    commons_title: page.title || entry.title,
    description_url: info.descriptionurl || "",
    original_url: info.url || "",
    thumb_url: normalizeThumbUrl(info.thumburl || info.url || ""),
    width: info.width ?? null,
    height: info.height ?? null,
    mime: info.mime || "",
    license,
    license_short_name: licenseShortName,
    license_note: licenseInfo.note,
    date_time_original: dateTimeOriginal,
    object_name: objectName,
    image_description: imageDescription,
    artist,
    credit,
    year,
    needs_year: year === null,
    normalized_title: normalizeTitle(page.title || entry.title),
    size_exempt: Boolean(entry.fromFileArg),
    low_res: false,
    status: "kept",
    rejected_reason: null,
  };

  const longSide = Math.max(record.width || 0, record.height || 0);

  if (!licenseInfo.accepted) {
    record.status = "rejected";
    record.rejected_reason = "license";
  } else if (!extensionForMime(record.mime)) {
    record.status = "rejected";
    record.rejected_reason = "format";
  } else if (!record.size_exempt) {
    if (longSide >= opts.minPx) {
      record.status = "kept";
    } else if (longSide >= opts.lowResFloor) {
      record.status = "low_res";
      record.low_res = true;
    } else {
      record.status = "rejected";
      record.rejected_reason = "too_small";
    }
  }

  if (
    record.status !== "rejected" &&
    record.year !== null &&
    record.year > opts.maxYear
  ) {
    record.status = "rejected";
    record.rejected_reason = "too_late";
    record.low_res = false;
  }

  return record;
}

function buildReviewHtml(folder, records) {
  const normalRecords = records.filter((record) => record.status === "kept");
  const lowResRecords = records.filter(
    (record) => record.status === "low_res",
  );

  function sortRecords(items) {
    return items.slice().sort((a, b) => {
      const byTitle = a.normalized_title.localeCompare(b.normalized_title);
      if (byTitle !== 0) return byTitle;
      return a.commons_title.localeCompare(b.commons_title);
    });
  }

  const sortedNormal = sortRecords(normalRecords);
  const sortedLowRes = sortRecords(lowResRecords);

  const largest = new Map();
  for (const record of sortedNormal) {
    const pixels = (record.width || 0) * (record.height || 0);
    const previous = largest.get(record.normalized_title);
    if (!previous || pixels > previous.pixels) {
      largest.set(record.normalized_title, {
        key: record.commons_title,
        pixels,
      });
    }
  }

  function toCard(record, sourceIndex, source, lowRes) {
    return {
      commons_title: record.commons_title,
      pageid: record.pageid,
      original_url: record.original_url,
      thumb_url: record.thumb_url,
      description_url: record.description_url,
      license: record.license,
      license_short_name: record.license_short_name,
      license_note: record.license_note || "",
      credit: record.credit,
      artist: record.artist,
      date_string: record.date_time_original,
      width: record.width,
      height: record.height,
      mime: record.mime,
      year: record.year,
      object_name: record.object_name,
      image_description: (record.image_description || "").slice(0, 300),
      low_res: lowRes,
      _preKeep:
        !lowRes &&
        largest.get(record.normalized_title).key === record.commons_title,
      _isDuplicate:
        sourceIndex > 0 &&
        source[sourceIndex - 1].normalized_title === record.normalized_title,
    };
  }

  const normalCards = sortedNormal.map((record, index) =>
    toCard(record, index, sortedNormal, false),
  );
  const lowResCards = sortedLowRes.map((record, index) =>
    toCard(record, index, sortedLowRes, true),
  );
  const cards = [...normalCards, ...lowResCards];

  function renderCard(card, index, lowRes) {
    const displayTitle =
      card.object_name || card.commons_title.replace(/^File:/i, "");
    const description = (card.image_description || "").slice(0, 300);
    const titleValue = plainTitle(card.object_name, card.commons_title);
    const yearValue = card.year === null ? "" : String(card.year);
    const lowResBadge = lowRes
      ? `<span class="badge lowres">low res ${escapeHtml(card.width)}×${escapeHtml(card.height)}</span>`
      : "";
    const licenseBadge =
      card.license_note === "no_known_restrictions"
        ? '<span class="badge lic">No known restrictions: check</span>'
        : "";
    const acceptLowRes = lowRes
      ? '<label class="accept-lowres"><input type="checkbox" class="accept-lowres-cb"> accept low-res exception</label>'
      : "";

    return `
      <article class="card${lowRes ? " low-res-card" : ""}" data-index="${index}">
        <div class="thumb">
          <img src="${escapeHtml(card.thumb_url || card.original_url)}" alt="" loading="lazy">
        </div>
        <div class="info">
          <h2>${escapeHtml(displayTitle)}</h2>
          ${card._isDuplicate ? '<span class="badge dup">possible duplicate</span>' : ""}
          ${lowResBadge}
          ${licenseBadge}
          <p class="small"><strong>Size:</strong> ${escapeHtml(card.width)} × ${escapeHtml(card.height)}</p>
          <p class="small"><strong>Licence:</strong> ${escapeHtml(card.license_short_name || card.license)}</p>
          <p class="small"><strong>Date:</strong> ${escapeHtml(card.date_string || "—")}</p>
          <p class="small"><strong>Commons:</strong> <a href="${escapeHtml(card.description_url)}" target="_blank" rel="noopener noreferrer">description page</a></p>
          <p class="desc">${escapeHtml(description || "—")}</p>
        </div>
        <div class="fields">
          <label class="keep"><input type="checkbox" class="keep-cb" ${card._preKeep ? "checked" : ""}> keep</label>
          ${acceptLowRes}

          <fieldset>
            <legend>Nudity *</legend>
            <label><input type="radio" name="nudity-${index}" value="nude"> nude</label>
            <label><input type="radio" name="nudity-${index}" value="not-nude"> not-nude</label>
          </fieldset>

          <label>Gender *
            <select class="gender">
              <option value="">—</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="couple">couple</option>
              <option value="group">group</option>
              <option value="mixed">mixed</option>
              <option value="none">none (no people)</option>
            </select>
          </label>

          <label class="minor"><input type="checkbox" class="minor-cb"> possible minor</label>

          <label>Title *
            <input type="text" class="title-input" value="${escapeHtml(titleValue)}">
          </label>

          <label>Year *
            <input type="number" class="year-input" value="${escapeHtml(yearValue)}" min="1820" max="1999">
          </label>

          <label>Color
            <select class="color">
              <option value="bw" selected>bw</option>
              <option value="sepia">sepia</option>
              <option value="color">color</option>
            </select>
          </label>

          <label class="portrait"><input type="radio" class="portrait-radio" name="portrait" value="${index}"> use as photographer portrait</label>
        </div>
      </article>`;
  }

  const normalHtml = normalCards
    .map((card, index) => renderCard(card, index, false))
    .join("\n");

  const lowResHtml = lowResCards
    .map((card, index) =>
      renderCard(card, normalCards.length + index, true),
    )
    .join("\n");

  const json = JSON.stringify(cards)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Commons review — ${escapeHtml(folder)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f4f2; color: #1c1c1c; }
  .bar { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 12px 20px; background: #fff; border-bottom: 1px solid #d8d8d2; box-shadow: 0 1px 6px rgba(0,0,0,.06); }
  .bar .counts { font-weight: 600; }
  .bar button { margin-left: auto; padding: 8px 16px; border: 0; border-radius: 6px; background: #1c1c1c; color: #fff; font-size: 15px; cursor: pointer; }
  .bar button:hover { background: #333; }
  #status { flex-basis: 100%; font-size: 13px; color: #a33; }
  #missingList { flex-basis: 100%; font-size: 13px; color: #a33; }
  .wrap { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 18px; padding: 20px; }
  .lowres-section { margin-top: 10px; padding: 0 0 30px; border-top: 1px solid #d8d8d2; }
  .lowres-head { padding: 20px 20px 0; }
  .lowres-head h2 { margin: 0 0 6px; font-size: 20px; }
  .lowres-head p { margin: 0; font-size: 13px; color: #666; }
  .lowres-section .wrap { padding-top: 14px; }
  .card { display: flex; flex-direction: column; background: #fff; border: 1px solid #d8d8d2; border-radius: 10px; overflow: hidden; }
  .card.kept { border-color: #2f7d32; box-shadow: 0 0 0 2px #2f7d3222; }
  .thumb { height: 260px; background: #e8e8e4; display: flex; align-items: center; justify-content: center; }
  .thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .info { padding: 12px 14px 4px; }
  .info h2 { margin: 0 0 6px; font-size: 15px; line-height: 1.3; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
  .badge.dup { background: #fff1c2; color: #6b5200; }
  .badge.lowres { background: #ffe0b2; color: #7a3e00; }
  .badge.lic { background: #e3f2fd; color: #0d47a1; }
  .small { margin: 3px 0; font-size: 12px; color: #555; }
  .desc { margin: 8px 0 0; font-size: 12px; color: #444; line-height: 1.4; }
  .fields { display: flex; flex-direction: column; gap: 9px; padding: 10px 14px 14px; border-top: 1px solid #eee; }
  .fields label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #333; }
  .fields label.keep, .fields label.minor, .fields label.portrait, .fields label.accept-lowres { flex-direction: row; align-items: center; gap: 7px; font-weight: 500; }
  .fields label.accept-lowres { color: #7a3e00; }
  .fields fieldset { margin: 0; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; }
  .fields legend { padding: 0 4px; font-size: 12px; font-weight: 700; color: #333; }
  .fields fieldset label { display: inline-flex; flex-direction: row; align-items: center; gap: 4px; margin-right: 12px; font-weight: 500; }
  .fields input[type=text], .fields input[type=number], .fields select { padding: 6px 8px; border: 1px solid #ccc; border-radius: 5px; font: inherit; font-size: 13px; }
  .fields input[type=text], .fields input[type=number] { width: 100%; }
  body.only-kept .card:not(.kept) { display: none; }
</style>
</head>
<body>
<header class="bar">
  <div class="counts"><span id="keptCount">0</span> kept · <span id="missingCount">0</span> missing required fields</div>
  <label><input type="checkbox" id="onlyKept"> show only kept</label>
  <button id="save">Save decisions</button>
  <span id="status"></span>
  <div id="missingList"></div>
</header>
<main class="wrap">
${normalHtml}
</main>
${
  lowResCards.length > 0
    ? `<section class="lowres-section" id="lowres-section">
  <div class="lowres-head">
    <h2>Low resolution — exceptions only</h2>
    <p>Keep a card here only when there is no higher-resolution copy; tick both “keep” and “accept low-res exception”.</p>
  </div>
  <div class="wrap">
${lowResHtml}
  </div>
</section>`
    : ""
}
<script>
const CANDIDATES = ${json};
const FOLDER = ${JSON.stringify(folder).replace(/</g, "\\u003c")};
const cards = Array.from(document.querySelectorAll(".card"));

function readCard(card) {
  const index = Number(card.dataset.index);
  const candidate = CANDIDATES[index];
  const yearRaw = card.querySelector(".year-input").value.trim();
  const nudityInput = card.querySelector('input[name="nudity-' + index + '"]:checked');
  const acceptLowRes = card.querySelector(".accept-lowres-cb");

  return {
    commons_title: candidate.commons_title,
    pageid: candidate.pageid,
    keep: card.querySelector(".keep-cb").checked,
    nudity: nudityInput ? nudityInput.value : "",
    gender: card.querySelector(".gender").value,
    possible_minor: card.querySelector(".minor-cb").checked,
    mosaic_title: card.querySelector(".title-input").value.trim(),
    year: yearRaw === "" ? "" : Number(yearRaw),
    color: card.querySelector(".color").value,
    portrait: card.querySelector(".portrait-radio").checked,
    low_res: Boolean(candidate.low_res),
    accept_low_res: acceptLowRes ? acceptLowRes.checked : false,
    license_note: candidate.license_note || "",
    original_url: candidate.original_url,
    description_url: candidate.description_url,
    license: candidate.license,
    license_short_name: candidate.license_short_name,
    credit: candidate.credit,
    artist: candidate.artist,
    date_string: candidate.date_string,
    width: candidate.width,
    height: candidate.height,
    mime: candidate.mime,
  };
}

function isComplete(decision) {
  const fieldsOk = Boolean(
    decision.nudity &&
      decision.gender &&
      decision.mosaic_title &&
      decision.year !== "" &&
      decision.year !== null &&
      Number.isFinite(Number(decision.year)),
  );

  if (!fieldsOk) return false;
  if (decision.low_res && !decision.portrait && !decision.accept_low_res) {
    return false;
  }

  return true;
}

function update() {
  let kept = 0;
  let missing = 0;
  const missingNames = [];

  for (const card of cards) {
    const decision = readCard(card);
    card.classList.toggle("kept", decision.keep);

    if (decision.keep) {
      kept += 1;
      if (!isComplete(decision)) {
        missing += 1;
        missingNames.push(decision.mosaic_title || decision.commons_title);
      }
    }
  }

  document.getElementById("keptCount").textContent = String(kept);
  document.getElementById("missingCount").textContent = String(missing);
  document.getElementById("missingList").textContent = missingNames.join(" · ");

  const onlyKept = document.getElementById("onlyKept").checked;
  document.body.classList.toggle("only-kept", onlyKept);

  const lowResSection = document.getElementById("lowres-section");
  if (lowResSection) {
    const hasKeptLowRes = Boolean(lowResSection.querySelector(".card.kept"));
    lowResSection.style.display = onlyKept && !hasKeptLowRes ? "none" : "";
  }
}

document.addEventListener("input", update);
document.addEventListener("change", update);

document.getElementById("save").addEventListener("click", () => {
  const decisions = cards.map(readCard);
  const incomplete = decisions.filter(
    (decision) => decision.keep && !isComplete(decision),
  );

  if (incomplete.length > 0) {
    const names = incomplete.map(
      (decision) => decision.mosaic_title || decision.commons_title,
    );
    document.getElementById("status").textContent =
      "Cannot save: " +
      incomplete.length +
      " kept card(s) missing required fields or low-res acceptance.";
    document.getElementById("missingList").textContent = names.join(" · ");
    return;
  }

  const payload = {
    folder: FOLDER,
    generated_at: new Date().toISOString(),
    decisions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "decisions.json";
  link.click();
  URL.revokeObjectURL(link.href);

  document.getElementById("status").textContent =
    "Saved decisions.json (" + decisions.filter((d) => d.keep).length + " kept).";
});

update();
</script>
</body>
</html>
`;
}

async function runCandidates(opts) {
  if (opts.categories.length === 0 && opts.files.length === 0) {
    throw new Error("Provide at least one --category or --file.");
  }

  const filesByTitle = new Map();

  for (const file of opts.files) {
    const title = normalizeFileTitle(file);
    if (!filesByTitle.has(title)) {
      filesByTitle.set(title, { title, pageid: null, fromFileArg: true });
    }
  }

  const visited = new Set();
  for (const category of opts.categories) {
    await collectCategory(category, opts.depth, visited, filesByTitle);
  }

  const records = [];
  const seenPageIds = new Set();

  for (const entry of filesByTitle.values()) {
    const record = await fetchFileRecord(entry, opts);
    if (record.pageid !== null && record.pageid !== undefined) {
      if (seenPageIds.has(record.pageid)) continue;
      seenPageIds.add(record.pageid);
    }
    records.push(record);
  }

  const counts = { kept: 0, low_res: 0, rejected: 0, by_reason: {} };
  for (const record of records) {
    if (record.status === "kept") {
      counts.kept += 1;
    } else if (record.status === "low_res") {
      counts.low_res += 1;
    } else {
      counts.rejected += 1;
      counts.by_reason[record.rejected_reason] =
        (counts.by_reason[record.rejected_reason] || 0) + 1;
    }
  }

  const folderDir = path.join(IMG_ROOT, opts.folder);
  const commonsDir = path.join(folderDir, "_commons");
  fs.mkdirSync(commonsDir, { recursive: true });

  const manifest = {
    folder: opts.folder,
    generated_at: new Date().toISOString(),
    params: {
      categories: opts.categories,
      files: opts.files,
      depth: opts.depth,
      min_px: opts.minPx,
      low_res_floor: opts.lowResFloor,
      max_year: opts.maxYear,
    },
    counts,
    files: records,
  };

  const manifestPath = path.join(commonsDir, "manifest.json");
  const reviewPath = path.join(commonsDir, "review.html");

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(reviewPath, buildReviewHtml(opts.folder, records));

  console.log(`Kept: ${counts.kept}`);
  console.log(`Low-res exceptions: ${counts.low_res}`);
  console.log(`Rejected: ${counts.rejected}`);
  for (const [reason, count] of Object.entries(counts.by_reason)) {
    console.log(`  ${reason}: ${count}`);
  }
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Review:   ${reviewPath}`);
}

function makeFilename({
  folder,
  mosaicTitle,
  year,
  orientation,
  gender,
  color,
  nudity,
  extension,
  suffix,
}) {
  const baseSlug = slugifyTitle(mosaicTitle);
  const titleSlug = suffix ? `${baseSlug}-${suffix}` : baseSlug;
  const nudityPart = nudity === "not-nude" ? "_not-nude" : "";
  // "none" = no people: no gender token, so script 3 leaves gender empty.
  const genderPart = gender === "none" ? "" : `_${gender}`;
  return `${folder}_${titleSlug}_year-${year}_${orientation}${genderPart}_${color}${nudityPart}${extension}`;
}

const RATE_LIMIT_BACKOFF_MS = [30_000, 60_000, 120_000];
let lastDownloadAt = 0;

async function downloadFile(url, destination) {
  let rateLimitRetries = 0;
  for (let attempt = 0; attempt < 3; ) {
    // upload.wikimedia.org rate-limits bots: one file at a time, >= 1 s apart.
    const wait = 1000 - (Date.now() - lastDownloadAt);
    if (wait > 0) await sleep(wait);
    lastDownloadAt = Date.now();
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (res.status === 429 || res.status === 503) {
        if (rateLimitRetries >= RATE_LIMIT_BACKOFF_MS.length) {
          throw Object.assign(new Error(`${res.status} ${res.statusText}`), {
            final: true,
          });
        }
        const retryAfter = Number(res.headers.get("retry-after"));
        const delay =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : RATE_LIMIT_BACKOFF_MS[rateLimitRetries];
        rateLimitRetries += 1;
        console.log(
          `  ${res.status} from Commons, retry ${rateLimitRetries}/${RATE_LIMIT_BACKOFF_MS.length} in ${Math.round(delay / 1000)} s`,
        );
        await sleep(delay);
        continue;
      }
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destination, buffer);
      return;
    } catch (error) {
      attempt += 1;
      if (error.final || attempt === 3) throw error;
      await sleep(500 * attempt);
    }
  }
}

async function runApply(opts) {
  const decisionsPath = path.resolve(opts.apply);
  if (!fs.existsSync(decisionsPath)) {
    throw new Error(`decisions file not found: ${decisionsPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));
  const decisions = Array.isArray(raw) ? raw : raw.decisions;
  if (!Array.isArray(decisions)) {
    throw new Error("decisions.json must contain a decisions array.");
  }

  const kept = decisions.filter((decision) => decision.keep !== false);
  for (const decision of kept) {
    const mosaicTitle = (decision.mosaic_title || decision.title || "").trim();
    const yearRaw = decision.year;
    const year = Number(yearRaw);

    if (!mosaicTitle) {
      throw new Error(`Kept item is missing a title: ${decision.commons_title}`);
    }
    if (
      yearRaw === null ||
      yearRaw === undefined ||
      String(yearRaw).trim() === "" ||
      !Number.isFinite(year) ||
      year < 1820 ||
      year > 1999
    ) {
      throw new Error(`Kept item has an invalid year: ${mosaicTitle}`);
    }
    if (!VALID_NUDITY.includes(decision.nudity)) {
      throw new Error(`Kept item is missing nudity: ${mosaicTitle}`);
    }
    if (!VALID_GENDERS.includes(decision.gender)) {
      throw new Error(`Kept item is missing gender: ${mosaicTitle}`);
    }
    if (decision.color && !VALID_COLORS.includes(decision.color)) {
      throw new Error(`Invalid color for ${mosaicTitle}: ${decision.color}`);
    }
    if (decision.low_res && !decision.portrait && !decision.accept_low_res) {
      throw new Error(
        `Low-res item kept without accept_low_res: ${mosaicTitle}`,
      );
    }
  }

  const keptImages = kept.filter((decision) => !decision.portrait);
  const lowResKept = keptImages.filter((decision) => decision.low_res);
  const lowResRatio =
    keptImages.length > 0 ? lowResKept.length / keptImages.length : 0;

  const folderDir = path.join(IMG_ROOT, opts.folder);
  const originalsDir = path.join(folderDir, "originals");
  const commonsDir = path.join(folderDir, "_commons");
  fs.mkdirSync(originalsDir, { recursive: true });
  fs.mkdirSync(commonsDir, { recursive: true });

  const sourcesPath = path.join(commonsDir, "sources.csv");
  const existingRows = readSourcesIfExists(sourcesPath);
  const rowsByCommonsTitle = new Map(
    existingRows.map((row) => [row.commons_title, row]),
  );
  const rowsByFilename = new Map(
    existingRows.map((row) => [row.filename, row]),
  );
  const usedFilenames = new Set(existingRows.map((row) => row.filename));

  const rows = existingRows.slice();
  const downloaded = [];
  const skipped = [];
  const failed = [];
  const minorsHeldBack = [];

  for (const decision of kept) {
    const mosaicTitle = (decision.mosaic_title || decision.title || "").trim();
    const year = Number(decision.year);
    const nudity = decision.nudity;
    const gender = decision.gender;
    const color = decision.color || "bw";
    const orientation = orientationFor(
      Number(decision.width),
      Number(decision.height),
    );
    const extension =
      extensionForMime(decision.mime) ||
      extensionFromUrl(decision.original_url) ||
      ".jpg";

    if (decision.possible_minor) {
      minorsHeldBack.push({ decision, mosaicTitle });
      continue;
    }

    let filename = "";
    const existingRow = rowsByCommonsTitle.get(decision.commons_title);

    if (existingRow) {
      filename = existingRow.filename;
    } else if (decision.portrait) {
      filename = `000_aaa_${opts.folder}${extension}`;
    } else {
      const baseName = makeFilename({
        folder: opts.folder,
        mosaicTitle,
        year,
        orientation,
        gender,
        color,
        nudity,
        extension,
        suffix: "",
      });

      filename = baseName;
      let suffix = 2;

      while (
        usedFilenames.has(filename) ||
        (rowsByFilename.has(filename) &&
          rowsByFilename.get(filename).commons_title !== decision.commons_title)
      ) {
        filename = makeFilename({
          folder: opts.folder,
          mosaicTitle,
          year,
          orientation,
          gender,
          color,
          nudity,
          extension,
          suffix: String(suffix),
        });
        suffix += 1;
      }
    }

    const destination = path.join(originalsDir, filename);
    const sourceRow = {
      filename,
      mosaic_title: mosaicTitle,
      commons_title: decision.commons_title || "",
      description_url: decision.description_url || "",
      original_url: decision.original_url || "",
      license:
        decision.license_short_name || decision.license || "",
      credit: decision.credit || "",
      artist: decision.artist || "",
      date_string: decision.date_string || "",
      year: String(decision.year ?? ""),
      nudity,
      gender,
      orientation,
      color,
      possible_minor: decision.possible_minor ? "true" : "false",
      low_res: decision.low_res ? "true" : "false",
      license_note: decision.license_note || "",
    };

    if (fs.existsSync(destination) || existingRow) {
      skipped.push({ filename, mosaicTitle });
    } else {
      try {
        await downloadFile(decision.original_url, destination);
        downloaded.push({ filename, mosaicTitle });
        usedFilenames.add(filename);
      } catch (error) {
        failed.push({ filename, mosaicTitle, error: error.message });
        continue;
      }
    }

    const rowIndex = rows.findIndex(
      (row) =>
        row.filename === filename ||
        row.commons_title === decision.commons_title,
    );
    if (rowIndex >= 0) {
      rows[rowIndex] = sourceRow;
    } else {
      rows.push(sourceRow);
    }

    rowsByCommonsTitle.set(sourceRow.commons_title, sourceRow);
    rowsByFilename.set(sourceRow.filename, sourceRow);
    usedFilenames.add(sourceRow.filename);
  }

  writeCsv(sourcesPath, rows);

  console.log(`Downloaded: ${downloaded.length}`);
  console.log(`Skipped existing: ${skipped.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Minors held back: ${minorsHeldBack.length}`);
  console.log(`Low-res exceptions kept: ${lowResKept.length}`);
  if (lowResRatio > 0.1) {
    console.log(
      `WARNING: low-res exceptions are ${(lowResRatio * 100).toFixed(1)}% of kept images (limit 10%).`,
    );
  }

  if (downloaded.length > 0) {
    console.log("\nDownloaded files:");
    for (const item of downloaded) {
      console.log(`  ${item.filename}`);
    }
  }

  if (skipped.length > 0) {
    console.log("\nSkipped (already existed):");
    for (const item of skipped) {
      console.log(`  ${item.filename}`);
    }
  }

  if (minorsHeldBack.length > 0) {
    console.log("\nHeld back (possible minor — decide by hand):");
    for (const item of minorsHeldBack) {
      console.log(`  ${item.mosaicTitle} — ${item.decision.commons_title}`);
    }
  }

  if (failed.length > 0) {
    console.log("\nFailed downloads:");
    for (const item of failed) {
      console.log(`  ${item.filename}: ${item.error}`);
    }
    process.exitCode = 1;
  }

  console.log(`\nSources: ${sourcesPath}`);
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  if (opts.help) {
    usage();
    return;
  }

  if (!opts.folder) {
    console.error("Missing --folder.");
    usage();
    process.exit(1);
  }

  if (
    !Number.isInteger(opts.depth) ||
    opts.depth < 0 ||
    !Number.isInteger(opts.minPx) ||
    opts.minPx <= 0 ||
    !Number.isInteger(opts.lowResFloor) ||
    opts.lowResFloor <= 0 ||
    !Number.isInteger(opts.maxYear)
  ) {
    console.error(
      "--depth, --min-px, --low-res-floor and --max-year must be valid numbers.",
    );
    process.exit(1);
  }

  try {
    if (opts.apply) {
      await runApply(opts);
    } else {
      await runCandidates(opts);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
