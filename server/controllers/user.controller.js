// In this file we write business logic for to create user

// In this file we make component like register and login. when we make more than one component in single file then we  used 'export' keyword at starting of componemt and we do 'named export'.

import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";



// req -> request -> request which given by client to server
// res ->response ->response which given by server to client

// req.body (Request Body)->Contains the data sent by the client (frontend or API consumer) in a request towards server.
// It is undefined by default in Express, so we need middleware like express.json() to parse it.(app.use(express.json()); // Middleware to parse JSON body)

// res.body (Response Body)->Contains the data that the server sends back to the client in response.
// res.body Does not exist as a direct property in Express.js. Instead, we use methods like res.send(), res.json(), or res.status() to send responses.




// below register varible contain all conditions which are require during registeration
export const register=async(req,res)=>{
  try{
  
 // fron below statement server access name,email,password from frontend
    console.log(req.body);

  
    const{name,email,password}=req.body;

    // condition for one of data from name,email,password is not present

    if(!name || !email || !password){
      return res.status(400).json({
        success:false,
        message:"All feilds are require"
      })
    }

    // User.findOne({ email }): in this statement "User" is model which we created in "user.model.js"
    // User.findOne({ email }): This Mongoose method searches the 'users' collection for the first document where the email field matches the provided email value. If a matching document is found, it returns that document; otherwise, it returns null

    const user=await User.findOne({email});

    // STATUS -> jeva apan server la request send karato teva base on given request server apalyala response madhe status send karato .

    // Status TYPE ->
    // 1)200 serise->used by server to send "success status".
    // 2)300 serise->used by server to send "redirection status".(used to website on new address),
    // 3)400 serise->used by server to send "client side error" related status.
    // 3)500 serise->used by server to send "server side error" related status.
    // we use status(201) when new resourse being created(here account is created)


    // (
    // 1}// status(400) means the server would not process the request due to something the server consider client error.
  // )


  

    // condition when user try to enroll using allready enrolled email

    if(user){
      // status(400) means the server would not process the request due to something the server consider client error
      return res.status(400).json({
        success:false,
        message:"User already exist with this email"
      })
    }
    
    // Password Hashing: It's crucial to hash the user's password before saving it to the database to enhance security. 
    // we used hash function of bcrypt package to convert our password into 10 digit for to secure from hacker.
    const hashedPassword=await bcrypt.hash(password,10);

    // condition if user is not found,then we create user(here we only make key for those data whose required value true in user database schema)
    
    // User.create(): This is a Mongoose method that creates and saves a new document in the database
    await User.create({
      name,
      email,
      password:hashedPassword
    });
    
    // we use status(201) when new resourse being created(here account is created)
    return res.status(201).json({
      success:true,
      message:"Account created successfully"
    })
  }catch(error){
    console.log(error);
    // we use status(500) to return error which happen in backend server
    return res.status(500).json({
      success:false,
      message:"failed to register"
    })
  }
}

// below login varible contain all conditions which are require during login

export const login = async (req,res) => {
  try {

        // fron below statement we access email,password from frontend
      const {email, password} = req.body;

          // condition for one of data from email,password is not present.
      if(!email || !password){
          return res.status(400).json({
              success:false,
              message:"All fields are required."
          })
      }


      // condition for finding register user 
      // User.findOne({ email }): This Mongoose method searches the 'users' collection for the first document where the email field matches the provided email value. If a matching document is found, it returns that document; otherwise, it returns null
      const user = await User.findOne({email});
      if(!user){
          return res.status(400).json({
              success:false,
              message:"Incorrect email or password"
          })
      }

      // below statement used to compare user password from database and password which we type in frontend UI 
      // bcrypt.compare(password, user.password): This method compares the provided password with the hashed password stored in the database. It returns true if they match and false otherwise.
      // if password is not match then we return error message
       const isPasswordMatch = await bcrypt.compare(password, user.password);
      //  below statement used to hash password which we type in frontend UI
      const pass=await bcrypt.hash(user.password,10);
      console.log(pass);  
      if(!isPasswordMatch){
          return res.status(400).json({
              success:false,
              message:"Incorrect email or password"
          });
      }

      // token generation --> here we generate token for shure user is login
      // generateToken(res, user, `Welcome back ${user.name}`): This function generates a JWT token for the user and sends it in the response. It typically includes the user's ID and a welcome message.
      // The token is sent as a cookie in the response, allowing the client to store it
      generateToken(res, user, `Welcome back ${user.name}`);

  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to login"
      })
  }
}


// Try Block -->
// res.status(200): Sets the HTTP status code to 200, indicating a successful request.
// .cookie("token", "", { maxAge: 0 }): Attempts to clear the "token" cookie by setting its value to an empty string and its maxAge to 0 milliseconds. The intention here is to instruct the browser to delete the cookie immediately.
// .json({ message: "Logged out successfully.", success: true }): Sends a JSON response to the client with a success message.

export const logout = async (_,res) => {
  try {
      return res.status(200).cookie("token", "", {maxAge:0}).json({
          message:"Logged out successfully.",
          success:true
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to logout"
      }) 
  }
}

export const getUserProfile = async (req,res) => {
  try {
      const userId = req.id;
      const user = await User.findById(userId).select("-password").populate("enrolledCourses");
      if(!user){
        // status 404 means the server can not find the requested resource.
          // this means user is not found
          // hence we return error message
          
          return res.status(404).json({
              message:"Profile not found",
              success:false
          })
      }
      return res.status(200).json({
          success:true,
          user
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to load user"
      })
  }
}



export const updateProfile = async (req,res) => {
  try {
      const userId = req.id;
      const {name} = req.body;
      const profilePhoto = req.file;

      const user = await User.findById(userId);
      if(!user){
        // status 404 means the server can not find the requested resource.
          return res.status(404).json({
              message:"User not found",
              success:false
          }) 
      }
      // extract public id of the old image from the url is it exists;

      if(user.photoUrl){
          const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
          deleteMediaFromCloudinary(publicId);
      }

      // upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path);
      const photoUrl = cloudResponse.secure_url;

      const updatedData = {name, photoUrl};
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

      return res.status(200).json({
          success:true,
          user:updatedUser,
          message:"Profile updated successfully."
      })

  } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:"Failed to update profile"
      })
  }
}





// 🔍 Step-by-Step Explanation

// ✅ const userId = req.id;
// This req.id comes from the authentication middleware.
// It contains the logged-in user’s ID extracted from the JWT token.

// ✅ const { name } = req.body;
// Extracts the new name from the submitted form data.
// You sent this using formData.append("name", name) on the frontend.

// ✅ const profilePhoto = req.file;
// This is the uploaded image file.
// It comes from multer middleware:


// upload.single("profilePhoto")
// This req.file contains info like:


// {
//   fieldname: 'profilePhoto',
//   originalname: 'avatar.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   path: 'uploads/xxxx.jpg',
//   ...
// }

// ✅ const user = await User.findById(userId);
// Fetches the existing user from MongoDB using the extracted ID.

// ❌ if (!user) { ... }
// If the user doesn’t exist in the DB (somehow), it sends a 404 response:


// return res.status(404).json({ message: "User not found" });
// ✅ if (user.photoUrl) { ... }
// Checks if the user already has a profile photo stored (URL exists).
// If yes, it deletes the old image from Cloudinary to avoid duplicates.

// 🔸 Inside it:

// const publicId = user.photoUrl.split("/").pop().split(".")[0];
// Extracts the public ID from the Cloudinary URL:

// URL: https://res.cloudinary.com/demo/image/upload/v123456/abc123.jpg
// split("/") → takes last part: abc123.jpg
// split(".")[0] → removes extension: abc123 (public ID)

// deleteMediaFromCloudinary(publicId);
// Deletes the old image from Cloudinary using the ID.

// ✅ const cloudResponse = await uploadMedia(profilePhoto.path);
// Uploads the new image to Cloudinary using the local file path (profilePhoto.path).
// uploadMedia() is a utility function that handles the Cloudinary API.

// ✅ const photoUrl = cloudResponse.secure_url;
// After upload, Cloudinary returns a secure image URL.
// This URL is saved to the user’s photoUrl field in MongoDB.

// ✅ const updatedData = { name, photoUrl };
// Prepares an object containing:
// - name: The new name from the form
// - photoUrl: The new image URL from Cloudinary
// {
//   name: "New Name",
//   photoUrl: "https://res.cloudinary.com/..."
// }
// ✅ const updatedUser = await User.findByIdAndUpdate(...)
// Updates the user document in MongoDB with the new name and photoUrl.
// findByIdAndUpdate() finds the user by ID and updates it with the new data
//  above function is mangoose method which is used to update the user in database
// .select("-password") excludes the password field from the returned user object.
// { new: true } ensures the updated user is returned.

// const updatedUser = await User.findByIdAndUpdate(
//   userId,
//   updatedData,
//   { new: true }
// ).select("-password");
// Updates the user with the new name and photoUrl.

// { new: true } ensures the updated user is returned.
// select("-password") excludes password from the response.

// ✅ Sends Response

// return res.status(200).json({
//   success: true,
//   user: updatedUser,
//   message: "Profile updated successfully.",
// });
// Sends the updated user object and a success message back to the frontend.