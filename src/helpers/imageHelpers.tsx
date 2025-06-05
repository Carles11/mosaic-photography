// export function getImageDimensions(
//   url: string
// ): Promise<{ width: number; height: number }> {
//   return new Promise((resolve) => {
//     const img = new window.Image();
//     img.crossOrigin = "anonymous"; // Handle CORS for remote images

//     img.onload = () => {
//       resolve({ width: img.width, height: img.height });
//     };

//     img.onerror = (err) => {
//       // Optionally log the error for debugging
//       console.error("Failed to load image for dimensions:", url, err);
//       // You can either resolve with a default or reject
//       resolve({ width: 1, height: 1 }); // fallback, or use reject(err)
//     };

//     img.src = url;
//   });
// }
