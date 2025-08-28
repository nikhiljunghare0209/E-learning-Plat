// Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It integrates seamlessly with Express and provides a convenient way to handle file uploads.


import multer from "multer";

const upload = multer({dest:"uploads/"});
export default upload

// ' uploads/ ' in this file our photo's are store


// ✅ 1. What is Multer?
// Multer is an Express.js middleware used to handle multipart/form-data, which is primarily used for file uploads from the frontend.

// ✅ 2. Multer Configuration in Your Code
// import multer from "multer";

// const upload = multer({ dest: "uploads/" });
// export default upload;

// 🔍 What this does:
// multer({ dest: "uploads/" }) tells Multer:
// "Store all incoming uploaded files in a local folder called uploads/ on the server's disk."
// When the user uploads a photo (like from a React form with FormData), Multer:
// Parses the request
// Stores the file temporarily at uploads/<random-filename>.jpg
// Adds a file object to req, which you use in your controller (req.file)
// (
//  So why does Multer store the file locally?
// Because Multer needs a place to temporarily hold the uploaded file before you can do anything with it (like uploading to Cloudinary).
// )

// ✅ 3. How Multer Integrates in the Route
// Suppose your route is like this:

// import express from "express";
// import upload from "../middlewares/multer.js";
// import { updateProfile } from "../controllers/userController.js";

// const router = express.Router();

// router.put("/update-profile", upload.single("profilePhoto"), updateProfile);

// 🔍 What happens:
// upload.single("profilePhoto") tells Multer to handle a single file upload from the field named "profilePhoto" (from your form or frontend).

// It adds req.file with info like:

// {
//   fieldname: 'profilePhoto',
//   originalname: 'mypic.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'uploads/',
//   filename: 'a7e3f2d0b36b.jpg',
//   path: 'uploads/a7e3f2d0b36b.jpg',
//   size: 15324
// }
// You then access the uploaded file’s path via req.file.path and pass it to Cloudinary for permanent upload.

// ✅ 4. What Happens in updateProfile controller Function
// Let’s see how Multer fits into this flow:

// 🔄 Full Flow:
// Frontend sends a PUT request with:
// name in req.body
// profilePhoto file in req.file

// Multer:
// Stores the photo in uploads/
// Fills req.file.path with its location

// Backend:
// Checks for old image (user.photoUrl)
// Extracts publicId and deletes the old photo from Cloudinary
// Uploads the new photo from uploads/... to Cloudinary
// Updates the user record with new name and new photoUrl


// summery =>
  
// | Part                                  | Role                                                 |
// | ------------------------------------- | ---------------------------------------------------- |
// | `multer({ dest: "uploads/" })`        | Temporarily stores the uploaded photo on server disk |
// | `upload.single("profilePhoto")`       | Parses request and attaches file to `req.file`       |
// | `req.file.path`                       | Used to get file path for Cloudinary upload          |
// | `uploadMedia(req.file.path)`          | Uploads file to Cloudinary and returns a URL         |
// | `deleteMediaFromCloudinary(publicId)` | Deletes old photo if it exists                       |

