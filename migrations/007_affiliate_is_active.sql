-- 007: soft-hide affiliate partners and products.
--
-- Why: partners come and go (Amazon terminated the account in Sep 2026, and
-- may readmit later). Deleting rows loses curated titles and photographer
-- links; an `is_active` flag hides a partner from every surface (homepage
-- slider, photographer pages, /toolkit/[slug], sitemap) while keeping the data.
--
-- Run in Supabase → SQL editor. Safe to re-run.

alter table public.affiliate_advertisers
  add column if not exists is_active boolean not null default true;

alter table public.affiliate_products
  add column if not exists is_active boolean not null default true;

create index if not exists idx_affiliate_advertisers_active
  on public.affiliate_advertisers (is_active);

-- Hide partners we are not promoting right now (rows and products stay).
--   amazon         terminated 2026-09; re-enable if readmitted
--   poster-master  wall art unrelated to the collection; idle
--   big-wall-decor same
update public.affiliate_advertisers
   set is_active = false
 where slug in ('amazon', 'poster-master', 'big-wall-decor');

-- New partner: TASCHEN (Awin, six regional programmes routed by
-- /api/go/taschen — see src/app/api/go/taschen/route.ts).
insert into public.affiliate_advertisers
  (name, slug, platform, template, description, website_url, logo_url, editorial_note)
values
  ('TASCHEN',
   'taschen',
   'Awin',
   'default',
   'Art-book publisher since 1980. Monographs and anthologies on the photographers in this collection — Weston, Stieglitz, the early nude, and more.',
   'https://www.taschen.com/',
   null,
   '{"en": "TASCHEN publishes the reference editions for several photographers in this gallery. Links go to the TASCHEN store for your country.", "es": ""}'::jsonb)
on conflict (slug) do nothing;

-- Check:
-- select name, slug, is_active from public.affiliate_advertisers order by is_active desc, name;
