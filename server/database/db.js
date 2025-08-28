// this file contain code for connect server to mangoDb database.

import mongoose from "mongoose";

// async-await are keyword used to make asynchronomus function simpler.
// await keyword ony used in async function.
// await keyword pause the execution of its surrounding async function untilled promise is setttled.


// process.env.MONGO_URI retrieves the MongoDB connection string from environment variables.

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("error occured", error);
  }
};
export default connectDB;
