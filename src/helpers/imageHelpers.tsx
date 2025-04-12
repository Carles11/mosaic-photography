export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = encodeURI(url); // Properly encode the URL
    // console.log({ img });
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
  });
};
