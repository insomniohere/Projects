import cloudinary, { CLOUDINARY_FOLDERS, UPLOAD_OPTIONS } from './config';

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload original artwork (private, high-res)
 */
export async function uploadOriginal(
  fileBuffer: Buffer,
  filename: string
): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDERS.ORIGINALS,
          public_id: filename,
          resource_type: 'image',
          type: 'private', // Private access
          ...UPLOAD_OPTIONS,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading original:', error);
    throw new Error('Failed to upload original image');
  }
}

/**
 * Upload watermarked artwork (public)
 */
export async function uploadWatermarked(
  fileBuffer: Buffer,
  filename: string
): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDERS.WATERMARKED,
          public_id: filename,
          resource_type: 'image',
          type: 'upload', // Public access
          quality: 'auto:good', // Optimize quality
          fetch_format: 'auto', // Auto format selection
          ...UPLOAD_OPTIONS,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading watermarked:', error);
    throw new Error('Failed to upload watermarked image');
  }
}

/**
 * Generate thumbnail URL from Cloudinary
 */
export function generateThumbnailUrl(publicId: string, width = 400, height = 400): string {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  fileBuffer: Buffer,
  userId: string
): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDERS.AVATARS,
          public_id: `avatar_${userId}`,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }
}
