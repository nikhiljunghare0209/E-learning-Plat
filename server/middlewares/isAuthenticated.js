// this file have information about authentaction of user means token of user is present in server or not


import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // from below statement we get token which we allready generated
    const token = req.cookies.token;
    if (!token) {
      // status(401) is used for unauthorized user
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }
    console.log(token);
    
    // below statement verify token which we get with SECRET_KEY which is present in env file 
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);
    
    // below if condition used to check for invalid token
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    // here we take userID is define in generateToken.js
    req.id = decode.userID;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default isAuthenticated;
