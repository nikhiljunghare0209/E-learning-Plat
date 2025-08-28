

// In this file we make routes for user

// ROUTES -> routes is section of code that define how an application responds to client request

// express.Router() -> by using express.Router() we can organize our express app's routing logic,allowing us to define specific routes and middleware for different parts of our application


import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

 

const router=express.Router();


// when we goes to URL "/" then fristly 'isAuthenticated' function is called and then 'createCourse'
router.route("/").post(isAuthenticated,createCourse);
router.route("/search").get(isAuthenticated, searchCourse );
router.route("/published-courses").get( getPublishedCourse);
router.route("/").get(isAuthenticated,getCreatorCourses);
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"),editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

// when we want to update minor things then we used patch method insted of put method.

router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);





export default router;




