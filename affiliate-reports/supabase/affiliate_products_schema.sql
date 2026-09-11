create table public.affiliate_products (
  id uuid not null default gen_random_uuid (),
  advertiser_id uuid not null,
  type text not null,
  title jsonb not null default '{}'::jsonb,
  description jsonb null default '{}'::jsonb,
  affiliate_url text not null,
  image_url text null,
  photographer_author text null,
  created_at timestamp with time zone null default now(),
  sort_order integer not null default 0,
  featured boolean not null default false,
  advertiser_name text null,
  constraint affiliate_products_pkey primary key (id),
  constraint fk_advertiser foreign KEY (advertiser_id) references affiliate_advertisers (id) on delete CASCADE,
  constraint fk_photographer_author foreign KEY (photographer_author) references photographers (author) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_affiliate_products_advertiser on public.affiliate_products using btree (advertiser_id) TABLESPACE pg_default;

create index IF not exists idx_affiliate_products_author on public.affiliate_products using btree (photographer_author) TABLESPACE pg_default;