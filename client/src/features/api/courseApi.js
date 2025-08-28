import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:8080/api/v1/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    
    getSearchCourse:builder.query({
      query: ({searchQuery, categories, sortByPrice}) => {
        // Build query string
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`

        // append cateogry 
        if(categories && categories.length > 0) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`; 
        }

        // Append sortByPrice is available
        if(sortByPrice){
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`; 
        }

        return {
          url:queryString,
          method:"GET", 
        }
      }
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
    }),

    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),


// | Feature       | `PUT`                       | `PATCH`                      |
// | ------------- | --------------------------- | ---------------------------- |
// | Purpose       | Replace the entire resource | Update part of the resource  |
// | Data Required | Full object                 | Only the fields to update    |
// | Use Case      | Overwrite entire record     | Change one or few properties |


    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
    }),

//✅ What does this mean?

// url: `/${courseId}?publish=${query}`,
// This line is inside your RTK Query mutation (or query) config.

// 🔍 It dynamically builds the URL for the API call.
// Suppose:
// const courseId = "abc123";
// const query = "true";

// Then this URL:
// url: `/${courseId}?publish=${query}`
// Becomes:
// /abc123?publish=true

// 🔍 What's happening in the backend?
// In Express.js backend, you can get:
// req.params.courseId → "abc123" (from the URL path)
// req.query.publish → "true" (from the query string)

// 🔸What is "?" In a URL:
// The ? separates the path and the query parameters
// After ?, key-value pairs are sent (e.g. publish=true)
   //    ex. GET /api/course/123?publish=true


// ✅ You can avoid creating two separate controllers for "publish" and "unpublish" by:
// ➤ Using a single controller
// ➤ Passing a query parameter like ?publish=true or ?publish=false

// ✅ Why this is a good idea:
// Instead of doing this:


// // ❌ Not optimal: two separate routes
// PUT /course/publish/:courseId     --> sets publish = true
// PUT /course/unpublish/:courseId   --> sets publish = false

// You can do this:
// // ✅ Clean, flexible: one route + query
// PUT /course/:courseId?publish=true


  }),
});

export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,

} = courseApi;
