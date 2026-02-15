import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Cloudinary folders
export const CLOUDINARY_FOLDERS = {
  ORIGINALS: 'abyss/originals',
  WATERMARKED: 'abyss/watermarked',
  THUMBNAILS: 'abyss/thumbnails',
  AVATARS: 'abyss/avatars',
};

// Cloudinary upload options
export const UPLOAD_OPTIONS = {
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  max_file_size: 10485760, // 10MB
  resource_type: 'image' as const,
};
