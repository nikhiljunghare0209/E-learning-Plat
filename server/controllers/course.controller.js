import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";

export const createCourse=async(req,res)=>{
  try{
    req.id
// by below line we resive courseTitle and category from req.body
    const{courseTitle,category}=req.body;
    // if courseTitle and category is not present then below if statement is executed
    if(!courseTitle || !category){
      return res.status(400).json({
        message:"course title and category is required."
      })
    }
    
    // in below code we create object which contain  courseTitle,category,creator which is used to create course
    const course = await Course.create({
      courseTitle,
      category,
      creator:req.id
  });
  return res.status(201).json({
    course,
    message:"Course created."
})
  }
  catch(error){
    console.log(error);
    
    return res.status(500).json({
      message:"failed to create course"
    })
  }
}


export const getCreatorCourses = async (req,res) => {
  try {
      const userId = req.id;
      const courses = await Course.find({creator:userId});
      if(!courses){
          return res.status(404).json({
              courses:[],
              message:"Course not found"
          })
      };
      return res.status(200).json({
          courses, //// <- array of courses created by that user
          message:"Courses fetched successfully."
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          message:"Failed to create course"
      })
  }
}


export const editCourse = async (req,res) => {
    try {

        // The URL for below statement request might look like:
              // PUT /api/courses/:courseId
         // below line grabs the courseId from the URL parameter.
        const courseId = req.params.courseId;

        // below are the updated course details sent by the frontend in the form data.
        // They’ll be used to update the course in the database.
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;

        // You’re using multer to handle file uploads.
        // If the user uploads a new thumbnail image, it will be available here below.
        // If no file is uploaded, thumbnail will be undefined.
        const thumbnail = req.file;
        
        // Fetch the course document using its ID
        // If it doesn't exist, send a 404 response.

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }

        //✅ if (thumbnail) → Only do this if a new thumbnail was uploaded
        // ✅ Check if there's an existing thumbnail in the course:
        // Extract the Cloudinary public ID from the old URL (by splitting the path)
        // Delete the old image from Cloudinary using deleteMediaFromCloudinary(publicId)
        // ✅ Upload the new image to Cloudinary using uploadMedia(thumbnail.path)
        // ✅ courseThumbnail will now hold the new uploaded file response (which includes secure_url)

        let courseThumbnail;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        // This below object holds the fields to be updated.
        // courseThumbnail?.secure_url will only exist if a new image was uploaded; otherwise it remains undefined (won't override old one).
        const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};
        
        // Update the course with the new data
        // { new: true } returns the updated document instead of the old one
        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});
        // Returns the updated course and success message to the frontend
        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params;

        if(!lectureTitle || !courseId){
            return res.status(400).json({
                message:"Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create lecture"
        })
    }
}

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params ;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = [], sortByPrice =""} = req.query;
        console.log(categories);
        
        // create search query
        const searchCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query, $options:"i"}},
                {subTitle: {$regex:query, $options:"i"}},
                {category: {$regex:query, $options:"i"}},
            ]
        }

        // if categories selected
        if(categories.length > 0) {
            searchCriteria.category = {$in: categories};
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}

export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;
        
        const {courseId, lectureId} = req.params;
        // findById is a Mongoose method that retrieves a document by its ID.
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            })
        }

        // below we update lecture
        // lectureTitle, videoUrl, publicId, isPreviewFree are the fields that can be updated.
        // If they are provided in the request body, they will be updated.
        // If not provided, the existing values will remain unchanged.  
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if(videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
//         🔍 Full Explanation:
// 📌 Line 1:

// const course = await Course.findById(courseId);
// This line fetches the course document from the database using the courseId provided in the URL (req.params).
// It uses Mongoose's findById() method.
// The result is stored in the course variable.

// 📌 Line 2:

// if(course && !course.lectures.includes(lecture._id)){
// This checks two conditions:
// course must exist (i.e., findById didn’t return null).
// The current lecture._id is not already present in the course.lectures array.

// Why is this check important?
// To avoid adding the same lecture multiple times into the course’s lectures array.

// 📌 Line 3:
// course.lectures.push(lecture._id);
// If the lecture ID is not already in the course’s lectures list, this line adds it.

// 📌 Line 4:

// await course.save();
// This line saves the updated course document back to MongoDB, persisting the change (i.e., the added lecture ID).

// ✅ Why This Logic Is Needed:
// Imagine a scenario where:
// A lecture already exists in the DB but was never added to the course’s lectures array.
// Or maybe the lecture got removed manually from the course.
// To ensure data integrity, we check and link the lecture to the course if missing.
// This keeps the relationship between Course and its lectures accurate.


        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to edit lectures"
        })
    }
}

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        // findByIdAndDelete is a Mongoose method that finds a document by its ID and removes it from the database.
        // It returns the deleted document, or null if no document was found with that ID.
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}


export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        //save() the updated course
        // This will update the isPublished field in the database.
        // If publish is true, it will be set to true; if false, it will be set to false.
        // The save() method returns a promise, so we await it to ensure the operation completes before sending a response. 
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}
 