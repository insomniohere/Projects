import { nanoid } from 'nanoid';
import crypto from 'crypto';

/**
 * Generate a unique watermark ID
 */
export function generateWatermarkId(): string {
  // Generate a unique ID with prefix for easy identification
  return `ABYSS-${nanoid(16)}`;
}

/**
 * Generate a fingerprint hash for the image
 * This can be used to verify image authenticity
 */
export function generateFingerprint(
  imageBuffer: Buffer,
  watermarkId: string
): string {
  const hash = crypto.createHash('sha256');
  hash.update(imageBuffer);
  hash.update(watermarkId);
  return hash.digest('hex');
}

/**
 * Create watermark metadata object
 */
export interface WatermarkMetadata {
  id: string;
  fingerprint: string;
  timestamp: string;
  protectionLevel: 'basic' | 'standard' | 'enhanced';
  version: string;
}

export function createWatermarkMetadata(
  imageBuffer: Buffer,
  watermarkId: string,
  protectionLevel: 'basic' | 'standard' | 'enhanced' = 'standard'
): WatermarkMetadata {
  return {
    id: watermarkId,
    fingerprint: generateFingerprint(imageBuffer, watermarkId),
    timestamp: new Date().toISOString(),
    protectionLevel,
    version: '1.0.0',
  };
}

/**
 * Encode watermark data into a string that can be embedded
 */
export function encodeWatermarkData(metadata: WatermarkMetadata): string {
  return Buffer.from(JSON.stringify(metadata)).toString('base64');
}

/**
 * Decode watermark data from encoded string
 */
export function decodeWatermarkData(encoded: string): WatermarkMetadata | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding watermark data:', error);
    return null;
  }
}
