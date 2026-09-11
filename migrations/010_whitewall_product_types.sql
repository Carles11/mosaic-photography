-- 010: correct the WhiteWall product types.
--
-- All seven WhiteWall rows were typed 'framing', but only two of them are
-- framing. The homepage shelf has per-type tabs (Books / Prints / Framing /
-- Tools), so a mistyped row is invisible under the tab a visitor would look
-- for it in — and with Poster Master and Big Wall Décor now hidden, the Prints
-- tab had nothing left in it at all.
--
-- Safe to re-run.

update public.affiliate_products p
   set type = 'print'
  from public.affiliate_advertisers a
 where a.id = p.advertiser_id
   and a.slug = 'white-wall-de'
   and p.title->>'en' in (
     'Canvas Print',
     'Acrylic Masterprint',
     'WhiteWall Fine Art Prints',
     'Fine Art Print'
   );

update public.affiliate_products p
   set type = 'book'
  from public.affiliate_advertisers a
 where a.id = p.advertiser_id
   and a.slug = 'white-wall-de'
   and p.title->>'en' = 'Photo Book';

-- 'Wooden Frame' and 'Acrylic ArtBox Gift Edition' stay 'framing'.

-- Check:
-- select p.type, p.title->>'en'
--   from public.affiliate_products p
--   join public.affiliate_advertisers a on a.id = p.advertiser_id
--  where a.slug = 'white-wall-de'
--  order by p.type, 2;
