-- 008: TASCHEN product rows.
--
-- Run AFTER 007_affiliate_is_active.sql (which creates the TASCHEN advertiser
-- row). Safe to re-run: every insert is guarded on (affiliate_url,
-- photographer_author) not already existing.
--
-- affiliate_url is ALWAYS the local router, never an awin1.com link:
--   /api/go/taschen?u=<canonical /en/ taschen.com url>&ref=<clickref>
-- The router picks the Awin programme for the visitor's country and rewrites
-- the taschen.com language segment. See src/app/api/go/taschen/route.ts.
--
-- All seven titles below were verified live and in stock on taschen.com on
-- 11 Sep 2026. Note there is NO current TASCHEN Edward Weston — the 2001
-- TASCHEN Icons edition is out of print — so Weston gets no book row.
--
-- BEFORE RUNNING, VERIFY ONE THING: the four per-photographer placements of
-- "1000 Nudes" (Durieu, Moulin, von Plueschow, von Gloeden) and the three of
-- "The Male Nude" (Holland Day, von Gloeden, von Plueschow) assume those
-- photographers are actually plated in those books. Check the plate lists.
-- If one is not in the book, delete that insert — a book on a photographer
-- page that does not contain their work is exactly the thin-affiliate signal
-- we cannot afford.

begin;

with taschen as (
  select id from public.affiliate_advertisers where slug = 'taschen'
),
book_rows(type, title_en, description_en, path, ref, cover, author, featured, sort_order) as (
  values
  -- ---------------------------------------------------------------- Stieglitz
  ('book',
   'Alfred Stieglitz. Camera Work',
   'TASCHEN''s complete reprint of Camera Work, the quarterly Stieglitz published from 1903 to 1917 — the journal that defined Pictorialism and the Photo-Secession, reproduced from the original photogravures.',
   '/en/books/photography/45409/alfred-stieglitz-camera-work/',
   'stieglitz-camera-work', 'camera-work',
   'Alfred Stieglitz', true, 10),

  -- --------------------------------------------------------------- 1000 Nudes
  ('book',
   '1000 Nudes. A History of Erotic Photography from 1839-1939',
   'A survey of the nude in photography across the exact century this collection is drawn from, assembled from the Uwe Scheid collection.',
   '/en/books/photography/05423/1000-nudes-a-history-of-erotic-photography-from-1839-1939/',
   '1000-nudes', '1000-nudes',
   null, true, 20),

  ('book',
   '1000 Nudes. A History of Erotic Photography from 1839-1939',
   'Durieu''s nude studies sit at the very beginning of this survey of photography''s first century of the nude, drawn from the Uwe Scheid collection.',
   '/en/books/photography/05423/1000-nudes-a-history-of-erotic-photography-from-1839-1939/',
   '1000-nudes-durieu', '1000-nudes',
   'Eugene Durieu', false, 21),

  ('book',
   '1000 Nudes. A History of Erotic Photography from 1839-1939',
   'Moulin''s academic nudes are part of this survey of photography''s first century of the nude, drawn from the Uwe Scheid collection.',
   '/en/books/photography/05423/1000-nudes-a-history-of-erotic-photography-from-1839-1939/',
   '1000-nudes-moulin', '1000-nudes',
   'Felix Jacques Moulin', false, 21),

  ('book',
   '1000 Nudes. A History of Erotic Photography from 1839-1939',
   'Von Plüschow''s Italian studies appear in this survey of photography''s first century of the nude, drawn from the Uwe Scheid collection.',
   '/en/books/photography/05423/1000-nudes-a-history-of-erotic-photography-from-1839-1939/',
   '1000-nudes-plueschow', '1000-nudes',
   'Wilhelm Von Plueschow', false, 21),

  ('book',
   '1000 Nudes. A History of Erotic Photography from 1839-1939',
   'Von Gloeden''s Taormina work appears in this survey of photography''s first century of the nude, drawn from the Uwe Scheid collection.',
   '/en/books/photography/05423/1000-nudes-a-history-of-erotic-photography-from-1839-1939/',
   '1000-nudes-gloeden', '1000-nudes',
   'Baron Wilhelm Von Gloeden', false, 21),

  -- ----------------------------------------------------------- The Male Nude
  ('book',
   'The Male Nude',
   'David Leddick''s history of the male nude in photography, running from the nineteenth-century studies in this collection through to the twentieth century.',
   '/en/books/sex/45504/the-male-nude/',
   'male-nude-gloeden', 'the-male-nude',
   'Baron Wilhelm Von Gloeden', false, 30),

  ('book',
   'The Male Nude',
   'David Leddick''s history of the male nude in photography, running from the nineteenth-century studies in this collection through to the twentieth century.',
   '/en/books/sex/45504/the-male-nude/',
   'male-nude-plueschow', 'the-male-nude',
   'Wilhelm Von Plueschow', false, 30),

  ('book',
   'The Male Nude',
   'David Leddick''s history of the male nude in photography, covering Holland Day''s allegorical figure studies alongside his contemporaries.',
   '/en/books/sex/45504/the-male-nude/',
   'male-nude-holland-day', 'the-male-nude',
   'Fred Holland Day', false, 30),

  -- ------------------------------------------------------------ General shelf
  ('book',
   'A History of Photography. From 1839 to the Present',
   'A single-volume history of the medium from the daguerreotype onward, built on the George Eastman House collection — useful context for everything in this gallery.',
   '/en/books/photography/45405/a-history-of-photography-from-1839-to-the-present/',
   'history-of-photography', 'history-of-photography',
   null, true, 40),

  ('book',
   '20th Century Photography',
   'The Museum Ludwig collection surveyed decade by decade — where the pictorialists in this gallery hand over to the century that followed them.',
   '/en/books/photography/45406/20th-century-photography/',
   '20th-century-photography', '20th-century-photography',
   null, false, 41)
)
insert into public.affiliate_products
  (advertiser_id, type, title, description, affiliate_url, image_url,
   photographer_author, featured, sort_order, advertiser_name, is_active)
select
  taschen.id,
  book_rows.type,
  jsonb_build_object('en', book_rows.title_en),
  jsonb_build_object('en', book_rows.description_en),
  '/api/go/taschen?u=https://www.taschen.com' || book_rows.path || '&ref=' || book_rows.ref,
  'https://cdn.mosaic.photography/advertisers/product_images/taschen/' || book_rows.cover || '.webp',
  book_rows.author,
  book_rows.featured,
  book_rows.sort_order,
  'TASCHEN',
  true
from book_rows cross join taschen
where not exists (
  select 1 from public.affiliate_products p
   where p.affiliate_url = '/api/go/taschen?u=https://www.taschen.com' || book_rows.path || '&ref=' || book_rows.ref
     and p.photographer_author is not distinct from book_rows.author
);

commit;

-- Check:
-- select p.photographer_author, p.title->>'en' as title, p.affiliate_url, p.image_url
--   from public.affiliate_products p
--   join public.affiliate_advertisers a on a.id = p.advertiser_id
--  where a.slug = 'taschen'
--  order by p.sort_order, p.photographer_author nulls first;
