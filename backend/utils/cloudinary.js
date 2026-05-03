import dotenv from "dotenv";
dotenv.config(); 
import {v2 as cloudinary} from "cloudinary";
import e from "express";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image to Cloudinary
export async function uploadToCloudinary(filepath, folder="Doctors"){
    try {
      const result = await cloudinary.uploader.upload(filepath, {
        folder: folder,
        resource_type: "image",
      });
      fs.unlinkSync(filepath);
      return result;
    } catch (error) {
      console.log("Error uploading to Cloudinary:", error);
      throw error;
    
    }
  
}


// Function to delete an image from Cloudinary

export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result;
  } catch (error) {
    console.log("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export default cloudinary;



