//This file contain code for to create server

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

// Below  method from the dotenv package that loads environment variables from a .env file into process.env.
dotenv.config({})

// In below we call connectDB() from "./database/db.js" to connect server to mangoDB database.
connectDB();

// Below express is a function provided by the Express.js library.
// Calling express() creates an instance (app) of an Express application.
// This instance (app) represents your web server and allows you to define routes, middleware, and handle HTTP requests.

const app=express();



const PORT =process.env.PORT || 3000;

// below are default middleware which are require during writing backend code
// express.json()->This middleware is essential for handling data sent in the body of POST or PUT requests as JSON.
app.use(express.json());
// cookieParser()->This line integrates the cookie-parser middleware into the Express application. The cookie-parser middleware parses cookies attached to the client request object, making them accessible via req.cookies.
app.use(cookieParser());
// CORS() ->CORS is an HTTP-header based protocol that enables servers to specify which origins are permitted to access resources on the server.
// origin: "http://localhost:5173": Specifies the allowed origin for cross-origin requests. In this case, only requests originating from http://localhost:5173 are permitted to access the resources.
app.use(cors({
  origin:"http://localhost:5173", 
  credentials:true
}));

//fakat ya frontend URL varun alelya request lach backend data milato

// BELOW STATEMENT IS MIDDLEWARE
// MIDDLEWARE -> middleware is set of code which is perform specific action.it will create using use() express function

// apis
app.use("/api/v1/media", mediaRoute);

app.use("/api/v1/user",userRoute);
// meaning of above line going to path -> "http://localhost:8080/api/v1/user/register".here " /api/v1/user " is  commann  path.

app.use("/api/v1/course",courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// Here, app instance listens for requests on a 3000 port
//listen() function used to take/listen client request it take parameter as port.here, port number is 3000 
app.listen(PORT,()=>{
  console.log(`server listen at port ${PORT}`);
})


