// In this file we will create database schema for user data

import mongoose from "mongoose";

// new mongoose.Schema({...}) creates a schema (blueprint) for the User model.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,

      enum: ["instructor", "student"],
      default: "student",
    },
    enrolledCourses: [
      {
        // below statements used to create relation between user and course
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
// { timestamps: true } automatically adds user created time and updated time fields to the schema.

// for below statement,
// a) mongoose.model("User", userSchema)
// mongoose.model(...) creates a model based on a schema.
// "User" is the name of the model. (Mongoose automatically pluralizes the model name in database).
// userSchema is the schema that defines the structure of the User collection.
// b) export const User = ...
// export const User → Exports the User model so it can be imported in other files.

// this stataement Allows us to perform CRUD operations on users.

export const User = mongoose.model("User", userSchema);

// Schema ->
// 1)Defines the structure of documents

// Collection ->
// 1)A container that stores multiple MongoDB documents(data)
// 2) automatically created in MongoDB when data is inserted.
// 3)used for Storing documents in MongoDB

// MORE ABOUT COLLECTION ->
// 1)A MongoDB collection is similar to a table in relational databases (like MySQL or PostgreSQL). It is a container that stores multiple documents (similar to rows in SQL).

//2) Key Characteristics of a MongoDB Collection:
// a)Holds Documents (JSON-like objects)->
// Each document inside a collection is stored in BSON format (Binary JSON).
// Example of a document in a users collection:
// {
//   "_id": "65a3f1a1d2e4b89c3f567891",
//   "name": "John Doe",
//   "email": "john@example.com",
//   "role": "student",
//   "createdAt": "2024-02-25T12:34:56.789Z"
// }

//b) No Fixed Schema (Flexible Structure)->
// Unlike SQL tables, documents in a collection do not need to have the same structure.
// Example: One user document may have a photoUrl, while another does not.
// Automatically Created

//c) If a collection does not exist, MongoDB creates it automatically when a document is inserted.

// MODEL ->
// 1)A constructor function that interacts with a MongoDB collection
// 2)explicitly defined using mongoose.model().
// 3)used for Creating, reading, updating, and deleting documents( CRUD operations)
// 4)function used in CRUDE OPERATION -> [.find(), .save(), .updateOne()]
