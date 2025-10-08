import React from "react";

type ImageObjectProps = {
  contentUrl: string;
  name: string;
  description: string;
  creditText?: string;
  license?: string;
  acquireLicensePage?: string;
  width: string | number;
  height: string | number;
  encodingFormat: string;
};

type OrganizationProps = {
  name: string;
  url: string;
  logo?: string;
};

type PublisherProps = OrganizationProps;

type JsonLdSchemaProps = {
  type: "ImageGallery" | "ImageObject" | "WebSite" | "WebPage" | "Organization";
  name: string;
  description?: string;
  url?: string;
  images?: ImageObjectProps[];
  image?: ImageObjectProps;
  publisher?: PublisherProps;
  logo?: string;
};

/**
 * Component for adding structured data for SEO (images, galleries, homepage, org, etc.)
 *
 * Usage examples:
 * - Single image:
 *   <JsonLdSchema type="ImageObject" name="..." image={{...}} />
 * - Gallery:
 *   <JsonLdSchema type="ImageGallery" name="..." images={[...]} />
 * - Homepage/WebSite:
 *   <JsonLdSchema
 *     type="WebSite"
 *     name="Mosaic Photography"
 *     url="https://www.mosaic.photography"
 *     description="..."
 *     publisher={{
 *       name: "Mosaic Photography",
 *       url: "https://www.mosaic.photography",
 *       logo: "https://www.mosaic.photography/images/logo.png"
 *     }}
 *   />
 * - Organization:
 *   <JsonLdSchema
 *     type="Organization"
 *     name="Mosaic Photography"
 *     url="https://www.mosaic.photography"
 *     logo="https://www.mosaic.photography/images/logo.png"
 *     description="..."
 *   />
 * - Homepage as WebPage:
 *   <JsonLdSchema
 *     type="WebPage"
 *     name="Mosaic Photography Gallery"
 *     url="https://www.mosaic.photography"
 *     description="..."
 *   />
 */
export default function JsonLdSchema({
  type,
  name,
  description,
  url,
  images,
  image,
  publisher,
  logo,
}: JsonLdSchemaProps) {
  // For ImageGallery
  if (type === "ImageGallery" && images) {
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "ImageGallery",
      name,
      description,
      image: images.map((img) => ({
        "@type": "ImageObject",
        contentUrl: img.contentUrl,
        name: img.name,
        description: img.description,
        creditText: img.creditText,
        license: img.license,
        acquireLicensePage: img.acquireLicensePage,
        width: img.width,
        height: img.height,
        encodingFormat: img.encodingFormat,
      })),
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }

  // For single ImageObject
  if (type === "ImageObject" && image) {
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      contentUrl: image.contentUrl,
      name,
      description,
      creditText: image.creditText,
      license: image.license,
      acquireLicensePage: image.acquireLicensePage,
      width: image.width,
      height: image.height,
      encodingFormat: image.encodingFormat,
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }

  // For WebSite
  if (type === "WebSite" && url) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      url,
      description,
      publisher: publisher
        ? {
            "@type": "Organization",
            name: publisher.name,
            url: publisher.url,
            ...(publisher.logo
              ? {
                  logo: {
                    "@type": "ImageObject",
                    url: publisher.logo,
                  },
                }
              : {}),
          }
        : undefined,
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }

  // For Organization
  if (type === "Organization" && url) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url,
      description,
      logo: logo
        ? {
            "@type": "ImageObject",
            url: logo,
          }
        : undefined,
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }

  // For WebPage (homepage)
  if (type === "WebPage" && url) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name,
      url,
      description,
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    );
  }

  // Default: nothing to render
  return null;
}
