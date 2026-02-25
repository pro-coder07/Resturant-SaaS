import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

export const initCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    logger.info('✅ Cloudinary initialized successfully');
    return cloudinary;
  } catch (error) {
    logger.error('Failed to initialize Cloudinary:', error.message);
    process.exit(1);
  }
};

export const uploadToCloudinary = async (file, folder = 'restaurant-menu') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `restaurant-saas/${folder}`,
      resource_type: 'auto',
    });
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error.message);
    throw new Error('Image upload failed');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted image: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete failed:', error.message);
  }
};

export default cloudinary;
