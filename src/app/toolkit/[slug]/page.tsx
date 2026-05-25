import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

type TemplateProps = {
  advertiser: AffiliateAdvertiser;
  products: AffiliateProduct[];
  locale: string;
};

const TemplateSoftware = dynamic(
  () => import("@/components/toolkit/templates/TemplateSoftware"),
);
const TemplatePrint = dynamic(
  () => import("@/components/toolkit/templates/TemplatePrint"),
);
const TemplateMarketplace = dynamic(
  () => import("@/components/toolkit/templates/TemplateMarketplace"),
);
const TemplateDefault = dynamic(
  () => import("@/components/toolkit/templates/TemplateDefault"),
);

const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateProps>> = {
  software: TemplateSoftware,
  print: TemplatePrint,
  marketplace: TemplateMarketplace,
  default: TemplateDefault,
};

export async function generateStaticParams() {
  const { data, error } = await supabaseServerClient
    .from("affiliate_advertisers")
    .select("slug");
  if (error) throw error;
  return (data || []).map((row: { slug: string }) => ({ slug: row.slug }));
}

export async function generateMetadata(props: { params: { slug: string } }) {
  const params = await Promise.resolve(props.params);

  const { slug } = params;
  const { data: advertiser } = await supabaseServerClient
    .from("affiliate_advertisers")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!advertiser) return {};
  return {
    title: `${advertiser.name} – Mosaic Toolkit`,
    description: advertiser.description || undefined,
    openGraph: {
      title: advertiser.name,
      description: advertiser.description || undefined,
      images: advertiser.logo_url ? [advertiser.logo_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: advertiser.name,
      description: advertiser.description || undefined,
      images: advertiser.logo_url ? [advertiser.logo_url] : [],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `/toolkit/${slug}` },
  };
}

export default async function ToolkitPage(props: { params: { slug: string } }) {
  const params = await Promise.resolve(props.params);
  const { slug } = params;
  const { data: advertiser } = await supabaseServerClient
    .from("affiliate_advertisers")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!advertiser) return notFound();

  const { data: products } = await supabaseServerClient
    .from("affiliate_products")
    .select("*")
    .eq("advertiser_id", advertiser.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const Template = TEMPLATE_MAP[advertiser.template] || TemplateDefault;

  return (
    <Template advertiser={advertiser} products={products || []} locale="en" />
  );
}
