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

type JsonLdSchemaProps = {
  type: "ImageGallery" | "ImageObject";
  name: string;
  description: string;
  images?: ImageObjectProps[];
  image?: ImageObjectProps;
};

/**
 * Component for adding structured data to improve image SEO for Google Image Search
 *
 * This component implements Schema.org structured data that helps Google understand
 * image content and context, improving visibility in Google Image Search results.
 * It supports both single images and image galleries with rich metadata.
 *
 * Usage examples:
 * 1. For a single image:
 *    <JsonLdSchema
 *      type="ImageObject"
 *      name="Image Title"
 *      description="Image Description"
 *      image={imageData}
 *    />
 *
 * 2. For a gallery:
 *    <JsonLdSchema
 *      type="ImageGallery"
 *      name="Gallery Title"
 *      description="Gallery Description"
 *      images={imagesArray}
 *    />
 *
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
 */
export default function JsonLdSchema({
  type,
  name,
  description,
  images,
  image,
}: JsonLdSchemaProps) {
  // For a gallery of images
  if (type === "ImageGallery" && images) {
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "ImageGallery",
      name: name,
      description: description,
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

  // For a single image
  if (type === "ImageObject" && image) {
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "ImageObject",
      contentUrl: image.contentUrl,
      name: name,
      description: description,
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

  return null;
}
