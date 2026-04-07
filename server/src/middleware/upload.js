import multer from 'multer';
<<<<<<< HEAD
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhdvoabjo',
    api_key: process.env.CLOUDINARY_API_KEY || '197366857231376',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'eACEHvpMlaZC_rUjOrhyIZUj-M3OE'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bookstore',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 1200, crop: 'limit' }]
    }
});

const parser = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880
    }
});

export const upload = parser;