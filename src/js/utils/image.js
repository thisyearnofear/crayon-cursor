// image.js
// Utility functions for image manipulation

/**
 * Converts a data URL to a Blob object
 * @param {string} dataUrl - The data URL to convert
 * @returns {Blob} The resulting Blob object
 */
export function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Crops the bottom third of an image
 * @param {string} imageDataUrl - The data URL of the image to crop
 * @returns {Promise<string>} A promise that resolves to the cropped image data URL
 */
export function cropBottomThird(imageDataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to 2/3 of the original height
      canvas.width = img.width;
      canvas.height = Math.floor(img.height * (2 / 3));

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Get the data URL of the cropped image
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = imageDataUrl;
  });
}

// Upscaling functionality removed as it's no longer needed

/**
 * Optimizes an image for minting by ensuring it's a proper PNG
 * @param {string} imageDataUrl - The data URL of the image to optimize
 * @returns {Promise<string>} A promise that resolves to the optimized image data URL
 */
export function optimizeImageForMinting(imageDataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      // Fill with white background to ensure transparency is handled correctly
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image on top
      ctx.drawImage(img, 0, 0);

      // Get the data URL as PNG with high quality
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.src = imageDataUrl;
  });
}
