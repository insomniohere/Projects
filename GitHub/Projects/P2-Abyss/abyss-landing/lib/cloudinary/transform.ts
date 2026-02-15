import cloudinary from './config';

/**
 * Generate responsive image URLs
 */
export function generateResponsiveUrls(publicId: string) {
  return {
    thumbnail: cloudinary.url(publicId, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto',
    }),
    medium: cloudinary.url(publicId, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
    }),
    large: cloudinary.url(publicId, {
      width: 1600,
      height: 1600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
    }),
    original: cloudinary.url(publicId, {
      quality: 'auto:best',
      fetch_format: 'auto',
    }),
  };
}

/**
 * Apply blur transformation (for sensitive content)
 */
export function generateBlurredUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    effect: 'blur:1000',
    quality: 'auto:low',
  });
}

/**
 * Generate optimized URL with custom transformations
 */
export function generateOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale';
    quality?: 'auto:low' | 'auto:good' | 'auto:best';
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'limit',
    quality: options.quality || 'auto:good',
    fetch_format: options.format || 'auto',
  });
}
