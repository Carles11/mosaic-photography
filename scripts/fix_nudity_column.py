import csv

input_csv = r'C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\images_resize_import_fix1.csv'
output_csv = r'C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\images_resize_import_fix_nudity.csv'

with open(input_csv, newline='', encoding='latin1') as infile, \
     open(output_csv, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        nudity = row.get('nudity', '').strip().lower()
        # Only allow 'nude', 'not-nude', or blank. Everything else becomes 'nude'
        if nudity not in ('nude', 'not-nude', ''):
            row['nudity'] = 'nude'
        writer.writerow(row)

print(f"Done! Fixed nudity column and saved to {output_csv}")