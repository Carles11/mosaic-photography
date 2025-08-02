import Image from "next/image";
import Link from "next/link";
import { PortfolioImage } from "@/types/portfolio";

interface PortfolioGalleryProps {
  images: PortfolioImage[];
}

export default function PortfolioGallery({ images }: PortfolioGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No photos have been added to this portfolio yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Link
          key={image.id}
          href={`/photos/${image.id}`}
          className="group block relative aspect-square overflow-hidden rounded-lg"
        >
          <Image
            src={image.thumbnailUrl || image.url}
            alt={image.title || "Portfolio image"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-end">
            <div className="p-3 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="font-medium truncate">{image.title}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
