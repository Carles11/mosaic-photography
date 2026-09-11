-- 009: TASCHEN hero / banner creative, and a TRACKED link on the hero CTA.
--
-- Run after 008. Safe to re-run.
--
-- WHY THIS EXISTS — the important half is the website_url.
--
-- `ToolkitHero` renders the page's main call to action as
--     <a href={advertiser.website_url}>Visit TASCHEN</a>
-- and every other Awin partner stores a TRACKED link there (Retouch4me,
-- WhiteWall, Poster Master and Big Wall Décor all hold a tidd.ly shortlink,
-- which is just Awin's shortener in front of cread.php).
--
-- 007 set TASCHEN's website_url to the plain https://www.taschen.com/, so the
-- biggest button on /toolkit/taschen would have sent people to TASCHEN with no
-- Awin hop and earned nothing. This points it at the router instead, so the
-- CTA is tracked like everything else and gets its own clickref.
--
-- BEFORE RUNNING: upload the three creative files to the CDN under the names
-- below (see the runbook, step 5b). A missing image is not fatal — the hero
-- falls back to its gradient — but the page looks unfinished.

update public.affiliate_advertisers
   set website_url =
         '/api/go/taschen?u=https://www.taschen.com/en/books/photography/&ref=toolkit-hero',

       logo_url =
         'https://cdn.mosaic.photography/advertisers/logos/taschen-logo.webp',

       header_url =
         'https://cdn.mosaic.photography/advertisers/banners/taschen/taschen-header.webp',

       banner_image_url =
         'https://cdn.mosaic.photography/advertisers/banners/taschen/taschen-banner.webp',

       banner_link_url =
         '/api/go/taschen?u=https://www.taschen.com/en/books/photography/&ref=toolkit-banner'
 where slug = 'taschen';

-- Check:
-- select name, website_url, logo_url, header_url, banner_image_url, banner_link_url
--   from public.affiliate_advertisers where slug = 'taschen';
--
-- website_url must start with /api/go/taschen — if it still says
-- https://www.taschen.com/ the CTA is untracked.
