import os
import csv
import re
from PIL import Image

ROOT = r"C:\Users\elcar\Documents\WEBs\Mosaic\IMGs"
ROOTOUTPUT = r"C:\Users\elcar\Documents\WEBs\Mosaic\Supabase"
CDN_BASE = "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection"
OUTPUT_CSV = os.path.join(ROOTOUTPUT, "images_resize_import_fix1.csv")

if not os.path.exists(ROOTOUTPUT):
    os.makedirs(ROOTOUTPUT)

def fix_author(author_raw):
    photographer_map = {
        "alfred-stieglitz": "Alfred Stieglitz",
        "matthew-brady": "Matthew Brady",
        "julia-margaret-cameron": "Julia Margaret Cameron",
        "baron-wilhelm-von-gloeden": "Baron Wilhelm Von Gloeden",
        "clarence-hudson-white": "Clarence Hudson White",
        "edward-weston": "Edward Weston",
        "anne-brigman": "Anne Brigman",
    }
    author_raw_lower = author_raw.strip().lower()
    
    for key, val in photographer_map.items():
        if author_raw_lower == key or author_raw_lower == key.replace("-", " "):
            return val
            
    if author_raw_lower:
        return " ".join([w.capitalize() for w in author_raw_lower.replace("-", " ").split()])
    return ""

def parse_filename(filename):
    name, _ = os.path.splitext(filename)
    if name.endswith("_ms"):
        name = name[:-3]
    
    # 1. Clean up "000_aaa_" prefix if present
    if name.startswith("000_aaa_"):
        name = name[len("000_aaa_"):]
        
    # 2. Extract year using regex (catches -year-XXXX or _year-XXXX)
    year = ""
    year_match = re.search(r'[-_]year-(\d{4})', name)
    if year_match:
        year = year_match.group(1)
        # Remove the year block from the name so it doesn't pollute the title
        name = name.replace(year_match.group(0), "")
        
    parts = name.split('_')
    author_raw = parts[0] if len(parts) > 0 else ""
    title_raw = parts[1] if len(parts) > 1 else ""
    
    orientation, gender, color, nudity = "", "", "", "nude"
    
    for p in parts[2:]:
        if p in ["vertical", "horizontal", "square"]:
            orientation = p
        elif p in ["bw", "color", "sepia"]:
            color = p
        elif p in ["male", "female", "couple", "group", "mixed"]:
            # Map couple and group to mixed
            if p in ["couple", "group"]:
                gender = "mixed"
            else:
                gender = p
        elif p == "not-nude" or p == "not":
            nudity = "not-nude"
            
    # Format Title (Title Case)
    title_words = [w for w in title_raw.replace("-", " ").split() if w]
    title_clean = " ".join([w.capitalize() for w in title_words])
    
    # Format Description (Sentence Case)
    desc_clean = ""
    if title_clean:
        # Capitalize first letter, lower case the rest, add period.
        desc_clean = title_clean[0].upper() + title_clean[1:].lower()
        if not desc_clean.endswith("."):
            desc_clean += "."
            
    return author_raw, title_clean, year, orientation, gender, color, nudity, desc_clean

def get_image_dimensions(full_path):
    try:
        with Image.open(full_path) as img:
            return img.width, img.height
    except Exception:
        return None, None

rows = []
target_photographers = ["matthew-brady", "julia-margaret-cameron"]

for photographer in target_photographers:
    pdir = os.path.join(ROOT, photographer)
    if not os.path.isdir(pdir): continue
    
    webp_dir = os.path.join(pdir, "originalsWEBP")
    if not os.path.isdir(webp_dir): continue
    
    for img_file in os.listdir(webp_dir):
        if not img_file.lower().endswith('.webp'):
            continue
            
        full_path = os.path.join(webp_dir, img_file)
        width, height = get_image_dimensions(full_path)
        
        author_raw, title, year, orientation, gender, color, nudity, desc = parse_filename(img_file)
        
        row = {
            "base_url": f"{CDN_BASE}/{photographer}",
            "filename": img_file, 
            "author": fix_author(author_raw),
            "title": title,
            "year": year,
            "orientation": orientation,
            "color": color,
            "nudity": nudity,
            "width": width,
            "height": height,
            "print_quality": "standard",
            "description": desc,
            "gender": gender,
            "moderation": '{"banned": {"web": false, "mobile": false}, "banned_at": null, "banned_reason": null}'
        }
        rows.append(row)

header = ["base_url", "filename", "author", "title", "year", "orientation", "color", "nudity", "width", "height", "print_quality", "description", "gender", "moderation"]

with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    writer.writerows(rows)

print(f"Done! Processed {len(rows)} images. CSV saved to {OUTPUT_CSV}")