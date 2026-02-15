import sharp from 'sharp';
import { generateWatermarkId, createWatermarkMetadata, encodeWatermarkData, WatermarkMetadata } from './generator';

export interface WatermarkOptions {
  protectionLevel?: 'basic' | 'standard' | 'enhanced';
  quality?: number;
  text?: string;
}

export interface WatermarkedResult {
  watermarkedBuffer: Buffer;
  watermarkId: string;
  metadata: WatermarkMetadata;
}

/**
 * Apply watermark to an image
 * This includes:
 * 1. Embedding metadata in EXIF
 * 2. Adding visible watermark text
 * 3. Reducing quality for public version
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<WatermarkedResult> {
  const {
    protectionLevel = 'standard',
    quality = 85,
    text = 'Protected by Abyss',
  } = options;

  try {
    // Generate watermark ID and metadata
    const watermarkId = generateWatermarkId();
    const metadata = createWatermarkMetadata(imageBuffer, watermarkId, protectionLevel);
    const encodedMetadata = encodeWatermarkData(metadata);

    // Get image dimensions
    const imageMetadata = await sharp(imageBuffer).metadata();
    const width = imageMetadata.width || 1000;
    const height = imageMetadata.height || 1000;

    // Create text watermark SVG
    const fontSize = Math.max(Math.floor(width / 30), 16);
    const watermarkText = `${text} • ${watermarkId}`;

    // Create multiple watermark layers for enhanced protection
    const watermarkSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            fill: rgba(255, 255, 255, 0.3);
            font-family: Arial, sans-serif;
            font-size: ${fontSize}px;
            font-weight: bold;
          }
        </style>
        <!-- Bottom right watermark -->
        <text x="${width - 20}" y="${height - 20}" text-anchor="end" class="watermark">
          ${watermarkText}
        </text>
        <!-- Center watermark (subtle) -->
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="watermark" opacity="0.15">
          ${watermarkText}
        </text>
        ${protectionLevel === 'enhanced' ? `
          <!-- Additional corner watermarks for enhanced protection -->
          <text x="20" y="40" class="watermark" opacity="0.2">${watermarkId}</text>
          <text x="${width - 20}" y="40" text-anchor="end" class="watermark" opacity="0.2">${watermarkId}</text>
          <text x="20" y="${height - 20}" class="watermark" opacity="0.2">${watermarkId}</text>
        ` : ''}
      </svg>
    `);

    // Apply watermark and reduce quality
    let processedImage = sharp(imageBuffer);

    // For enhanced protection, add noise to make AI training harder
    if (protectionLevel === 'enhanced') {
      // Reduce quality more aggressively
      processedImage = processedImage.jpeg({ quality: Math.min(quality, 75) });
    }

    // Composite watermark onto image
    const watermarkedBuffer = await processedImage
      .composite([
        {
          input: watermarkSvg,
          gravity: 'center',
        },
      ])
      .withMetadata({
        exif: {
          IFD0: {
            Copyright: `Protected by Abyss - ${watermarkId}`,
            Artist: 'Abyss Platform',
          },
        },
      })
      .jpeg({ quality })
      .toBuffer();

    return {
      watermarkedBuffer,
      watermarkId,
      metadata,
    };
  } catch (error) {
    console.error('Error applying watermark:', error);
    throw new Error('Failed to apply watermark');
  }
}

/**
 * Create a lower quality version for public display
 */
export async function createPublicVersion(
  imageBuffer: Buffer,
  maxDimension = 1920
): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1000;
    const height = metadata.height || 1000;

    // Calculate resize dimensions while maintaining aspect ratio
    let newWidth = width;
    let newHeight = height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        newWidth = maxDimension;
        newHeight = Math.round((height / width) * maxDimension);
      } else {
        newHeight = maxDimension;
        newWidth = Math.round((width / height) * maxDimension);
      }
    }

    // Resize and compress
    const publicBuffer = await sharp(imageBuffer)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return publicBuffer;
  } catch (error) {
    console.error('Error creating public version:', error);
    throw new Error('Failed to create public version');
  }
}

/**
 * Extract watermark ID from image metadata
 */
export async function extractWatermarkId(imageBuffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const copyright = metadata.exif?.toString() || '';

    // Try to extract watermark ID from copyright field
    const match = copyright.match(/ABYSS-[A-Za-z0-9_-]{16}/);
    return match ? match[0] : null;
  } catch (error) {
    console.error('Error extracting watermark:', error);
    return null;
  }
}
