import { useState } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
      onMouseEnter={() => setIsHovered(false)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative" }}
    >
      <Zoom>
        <Image
          src={image.url}
          alt={image.title}
          layout="responsive"
          width={0}
          height={0}
        />
      </Zoom>
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
