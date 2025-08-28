// In this file we make routes for user

// ROUTES -> routes is section of code that define how an application responds to client request


import express from "express";
import { getUserProfile, login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

// express.Router() -> by using express.Router() we can organize our express app's routing logic,allowing us to define specific routes and middleware for different parts of our application

const router=express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

// in below statement first call is goes for isAuthenticated middleware which check for authentication using token and then next call goes to getUserProfile 
router.route("/profile").get(isAuthenticated
  , getUserProfile);

  router.route("/profile/update").put(isAuthenticated,upload.single("profilePhoto"), updateProfile);


export default router;
