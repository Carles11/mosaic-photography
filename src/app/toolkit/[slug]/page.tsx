import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import { getToolkitDataBySlug } from "@/utils/fetchAffiliateDataSSR";
import ToolkitPageView from "@/components/analytics/ToolkitPageView";

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
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("affiliate_advertisers")
    .select("slug");
  if (error) throw error;
  return (data || []).map((row: { slug: string }) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { getToolkitDataBySlug: fetchAdvertiser } =
    await import("@/utils/fetchAffiliateDataSSR");
  const advertiser = await fetchAdvertiser(slug);

  if (!advertiser) return {};

  const keywords = [
    advertiser.name,
    advertiser.platform,
    "Photography Toolkit",
    "Photography Resources",
    "Mosaic Photography",
    `${advertiser.name} review`,
    `${advertiser.name} affiliate`,
  ];

  return {
    title: `${advertiser.name} – Photography Toolkit | Mosaic`,
    description:
      advertiser.description ||
      `Explore ${advertiser.name} resources and tools on Mosaic Photography Toolkit.`,
    keywords: keywords.join(", "),
    openGraph: {
      title: `${advertiser.name} | Mosaic Toolkit`,
      description: advertiser.description || "",
      siteName: "Mosaic Photography",
      images: advertiser.logo_url ? [{ url: advertiser.logo_url }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${advertiser.name} – Mosaic Toolkit`,
      description: advertiser.description || "",
      images: advertiser.logo_url ? [advertiser.logo_url] : [],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.mosaic.photography/toolkit/${slug}`,
    },
  };
}

export default async function ToolkitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const advertiser = await getToolkitDataBySlug(slug);

  if (!advertiser) return notFound();

  const products = advertiser.products || [];

  const Template = TEMPLATE_MAP[advertiser.template] || TemplateDefault;

  return (
    <>
      <ToolkitPageView advertiser={advertiser.name} />
      <JsonLdSchema
        type="CollectionPage"
        name={`${advertiser.name} Photography Toolkit`}
        url={`https://www.mosaic.photography/toolkit/${slug}`}
        description={advertiser.description || ""}
        images={products.map((p: AffiliateProduct) => ({
          contentUrl: p.image_url || "",
          name:
            typeof p.title === "string"
              ? p.title
              : (p.title as { en?: string })?.en || "",
          description:
            typeof p.description === "string"
              ? p.description
              : (p.description as { en?: string })?.en || "",
          width: 800,
          height: 600,
          encodingFormat: "image/webp",
        }))}
      />
      <Template advertiser={advertiser} products={products} locale="en" />
    </>
  );
}
