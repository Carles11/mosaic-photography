-- Migration: 012_images_exclude_from_index.sql
-- What: add exclude_from_index flag to images_resize and mark 18 flagged images
-- Why: keep images visible on www.mosaic.photography but exclude from search indexes/CDN robots
-- Date: 2026-10-24
-- Reversible: update public.images_resize set exclude_from_index = false where id in (...);

alter table public.images_resize
  add column if not exists exclude_from_index boolean not null default false;

update public.images_resize
   set exclude_from_index = true
 where id in (723,732,915,988,1101,1201,1275,1276,1337,1349,1353,1360,1370,1372,1377,1428,1489,1518);

-- check: expect 18 rows
select id, author, filename from public.images_resize where exclude_from_index order by id;
