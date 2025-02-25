// filepath: /C:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/components/ImageCard.tsx
import { useState } from "react";

interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
}

const ImageCard = ({ image }: { image: Image }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="image-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(image.url, "_blank")}
    >
      <img src={image.url} alt={image.title} />
      {isHovered && (
        <div className="overlay">
          <h3>{image.title}</h3>
          <p>{image.author}</p>
          <p>{image.description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
