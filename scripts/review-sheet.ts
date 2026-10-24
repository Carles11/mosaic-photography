import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { getBestS3FolderForWidth } from "../src/utils/imageResizingS3";
// For Node.js < 22
import ws from "ws";
// @ts-ignore
global.WebSocket = ws;

// Initialize Supabase client (same pattern as other scripts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

type ReviewImage = {
  id: number;
  base_url: string;
  filename: string;
  title?: string | null;
  author?: string | null;
  year?: number | string | null;
  gender?: string | null;
  width?: number | null;
  orientation?: string | null;
};

const PRIORITY_ORDER = [
  "Wilhelm Von Plueschow",
  "Baron Wilhelm Von Gloeden",
  "Fred Holland Day",
  "Felix Jacques Moulin",
  "Julia Margaret Cameron",
];

function getPriorityIndex(author?: string | null): number {
  if (!author) return PRIORITY_ORDER.length;
  const idx = PRIORITY_ORDER.findIndex((p) => author === p);
  return idx === -1 ? PRIORITY_ORDER.length : idx;
}

function sortAuthors(a: string, b: string): number {
  const ia = getPriorityIndex(a);
  const ib = getPriorityIndex(b);
  if (ia !== ib) return ia - ib;
  // any other author alphabetically
  return a.localeCompare(b);
}

async function generateReviewSheet() {
  const images: ReviewImage[] = [];
  const PAGE_SIZE = 1000;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("images_resize")
      .select(
        "id, base_url, filename, title, author, year, gender, width, orientation",
      )
      .eq("nudity", "nude")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching images_resize:", error);
      process.exit(1);
    }

    images.push(...((data as ReviewImage[]) ?? []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  if (images.length === 0) {
    console.error("No nude images found.");
    process.exit(1);
  }

  // Group by author
  const groups = new Map<string, ReviewImage[]>();
  for (const img of images) {
    const author = img.author || "Unknown";
    if (!groups.has(author)) groups.set(author, []);
    groups.get(author)!.push(img);
  }

  // Sort groups by priority then alphabetically
  const sortedAuthors = Array.from(groups.keys()).sort(sortAuthors);

  // Inside each group, sort by filename
  for (const author of sortedAuthors) {
    const list = groups.get(author)!;
    list.sort((a, b) => (a.filename || "").localeCompare(b.filename || ""));
  }

  // Generate HTML
  const generatedAt = new Date().toISOString();
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nude Review Sheet</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #f9f9f9; }
    .topbar { position: sticky; top: 0; background: #fff; border-bottom: 2px solid #333; padding: 10px 20px; display: flex; gap: 20px; align-items: center; z-index: 100; flex-wrap: wrap; }
    .topbar .info { flex: 1; min-width: 200px; }
    .topbar button { padding: 8px 16px; font-size: 14px; cursor: pointer; }
    .header { padding: 20px; background: #fff; border-bottom: 1px solid #ddd; }
    .header h1 { margin: 0 0 8px 0; font-size: 20px; }
    .header p { margin: 0; color: #666; }
    .author-section { padding: 20px; }
    .author-section h2 { margin: 30px 0 16px 0; font-size: 18px; padding-bottom: 8px; border-bottom: 2px solid #333; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .card { background: #fff; border: 3px solid #ddd; border-radius: 4px; overflow: hidden; cursor: pointer; transition: border-color 0.2s; }
    .card.ticked { border-color: #d33; }
    .card img { width: 100%; height: 200px; object-fit: cover; display: block; background: #eee; }
    .card-body { padding: 10px; }
    .card-body .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .card-body .meta { font-size: 11px; color: #333; line-height: 1.4; word-break: break-all; }
    .card-body .meta div { margin: 2px 0; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="info">
      <strong><span id="selected-count">0</span> selected</strong>
    </div>
    <button id="copy-btn">Copy selected IDs</button>
    <button id="clear-btn">Clear all</button>
  </div>
  <div class="header">
    <h1>Nude Review Sheet</h1>
    <p>Generated ${generatedAt} · ${images.length} nude images · tick any image where the person could be under 18</p>
  </div>
`;

  // Add each author section
  for (const author of sortedAuthors) {
    const list = groups.get(author)!;
    html += `  <div class="author-section">
    <h2>${escapeHtml(author)} — ${list.length} image${list.length === 1 ? "" : "s"}</h2>
    <div class="grid">
`;

    for (const img of list) {
      // Get thumbnail URL using getBestS3FolderForWidth with width 400
      let thumbUrl = "";
      try {
        const result = getBestS3FolderForWidth(
          {
            base_url: img.base_url || "",
            filename: img.filename || "",
            width: img.width || undefined,
          } as any,
          400,
        );
        thumbUrl = result.url || "";
      } catch (e) {
        // Fallback - just in case
        thumbUrl = "";
      }

      const id = img.id;
      const year = img.year !== null && img.year !== undefined ? img.year : "";
      const gender = img.gender || "";
      const filename = img.filename || "";

      html += `      <div class="card" data-id="${id}">
        <img src="${escapeHtml(thumbUrl)}" alt="" loading="lazy" onerror="this.style.display='none'">
        <div class="card-body">
          <div class="checkbox-row">
            <input type="checkbox" class="img-checkbox" data-id="${id}" id="cb-${id}">
            <label for="cb-${id}" style="cursor:pointer;">Select</label>
          </div>
          <div class="meta">
            <div><strong>id:</strong> ${id}</div>
            <div><strong>year:</strong> ${escapeHtml(String(year))}</div>
            <div><strong>gender:</strong> ${escapeHtml(String(gender))}</div>
            <div><strong>filename:</strong> ${escapeHtml(filename)}</div>
          </div>
        </div>
      </div>
`;
    }

    html += `    </div>
  </div>
`;
  }

  html += `  <script>
    const STORAGE_KEY = 'nude-review-v1';
    function getSelected() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr.map(x => String(x)));
      } catch(e) {
        return new Set();
      }
    }
    function saveSelected(set) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
      } catch(e) {}
    }
    function updateCount() {
      const sel = getSelected();
      document.getElementById('selected-count').textContent = sel.size;
    }
    function applyState() {
      const sel = getSelected();
      document.querySelectorAll('.img-checkbox').forEach(cb => {
        const id = cb.getAttribute('data-id');
        if (sel.has(id)) {
          cb.checked = true;
          cb.closest('.card').classList.add('ticked');
        } else {
          cb.checked = false;
          cb.closest('.card').classList.remove('ticked');
        }
      });
      updateCount();
    }
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.target.tagName === 'LABEL') return;
        const cb = card.querySelector('.img-checkbox');
        if (cb) {
          cb.checked = !cb.checked;
          const id = cb.getAttribute('data-id');
          const sel = getSelected();
          if (cb.checked) {
            sel.add(id);
            card.classList.add('ticked');
          } else {
            sel.delete(id);
            card.classList.remove('ticked');
          }
          saveSelected(sel);
          updateCount();
        }
      });
    });
    document.querySelectorAll('.img-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-id');
        const card = cb.closest('.card');
        const sel = getSelected();
        if (cb.checked) {
          sel.add(id);
          card.classList.add('ticked');
        } else {
          sel.delete(id);
          card.classList.remove('ticked');
        }
        saveSelected(sel);
        updateCount();
      });
    });
    document.getElementById('copy-btn').addEventListener('click', async () => {
      const sel = getSelected();
      const arr = Array.from(sel);
      // sort numerically if possible
      arr.sort((a,b) => {
        const na = parseInt(a), nb = parseInt(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a).localeCompare(String(b));
      });
      const text = arr.join(',');
      try {
        await navigator.clipboard.writeText(text);
        const btn = document.getElementById('copy-btn');
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = old; }, 1200);
      } catch(e) {
        alert('Failed to copy');
      }
    });
    document.getElementById('clear-btn').addEventListener('click', () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
      document.querySelectorAll('.img-checkbox').forEach(cb => {
        cb.checked = false;
        cb.closest('.card').classList.remove('ticked');
      });
      updateCount();
    });
    applyState();
  </script>
</body>
</html>
`;

  const reviewDir = path.join(process.cwd(), "review");
  if (!fs.existsSync(reviewDir)) {
    fs.mkdirSync(reviewDir, { recursive: true });
  }
  const outPath = path.join(reviewDir, "nude-review.html");
  fs.writeFileSync(outPath, html);

  // Print per-author counts
  console.log("Per-author counts:");
  for (const author of sortedAuthors) {
    console.log(`  ${author}: ${groups.get(author)!.length}`);
  }
  console.log(`Total: ${images.length}`);
  console.log(`Wrote: ${outPath}`);
}

function escapeHtml(s: string): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

generateReviewSheet().catch((err) => {
  console.error(err);
  process.exit(1);
});
