import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// below line initializes dotenv so you can use values like process.env.API_KEY, process.env.CLOUD_NAME, etc., from your .env file.
dotenv.config({});

// 🔍 What it does(below " .config() " function):
// This initializes and configures the Cloudinary SDK with your account credentials so you can communicate with Cloudinary's cloud servers from your Node.js backend.

// 🧠 Why it's important:
// Without this configuration, Cloudinary won’t know which account you're working with, and your upload or delete operations will fail

// | Key          | Description                                                                               |
// | ------------ | ----------------------------------------------------------------------------------------- |
// | `api_key`    | Public key used to identify your account. Think of it like a username.                    |
// | `api_secret` | **Private key** used to sign and secure API requests (like a password). Keep this hidden. |
// | `cloud_name` | Unique ID of your Cloudinary cloud. All your images/videos will be uploaded here.         |


cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});
// 🔍 Explanation Of Below Function :

// Purpose: Uploads any type of file (image, video, PDF, etc.).
// file: This should be the path to the file you want to upload (like './uploads/image.png' or a base64 string).
// resource_type: "auto": Automatically detects the file type (image, video, etc.) and handles it accordingly.
// cloudinary.uploader.upload(...): The core function that uploads the file to your Cloudinary storage.
// Returns: The response object containing details like secure_url, public_id, etc.
export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.log(error);
  }
};

// 🔍 Explanation  Of Below Function:
// Purpose: Deletes a file (usually an image) from Cloudinary.
// publicId: The unique ID of the file in Cloudinary (e.g., sample_folder/my_image123).
// destroy(...): Deletes the file. By default, it assumes resource_type: 'image'.

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

// 🔍 Explanation  Of Below Function:

// Purpose: Specifically deletes a video file.
// Why this is separate: If you try to delete a video using the default resource_type, it might fail since it defaults to "image".



export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"});
    } catch (error) {
        console.log(error);
        
    }
}

