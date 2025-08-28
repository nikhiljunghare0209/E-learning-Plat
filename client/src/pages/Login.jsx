// LspY9350B3QZfZ29

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  // STATE => In React, state is an object that holds dynamic data specific to a component. It allows components to reactively update when data changes—without reloading the page.

// Unlike props (which are read-only and passed from parent to child), state is mutable and is managed inside a component

  // HOOK THEORY ==>

  // 1) Before Hooks, only class components could manage state and lifecycle methods. Hook is the function that  allow functional components to manage state and other React features, making functional component more powerful and easier to work with.
  // 2)Hooks can not be used inside loops, conditions, or nested functions.
  // 3)They must be used inside React functional components.

  // useState is hook which contain two array element first store the new values and second element is method which repaint the component on which state define and child component of it base on first element . useState also has default state

  // below useState has 'signupInput' as first element and 'setSignupInput' as second element (method). here,default state contain empty object with three key with no value

// ✅ Benefits of initializing as an object:
// Centralizes form data into one state variable.
// Easy to reset form (setSignupInput({ name: "", email: "", password: "" })).
// Cleaner and scalable if more fields are added later.


  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  // mutation use in square bracket[]
  
  const [
    registerUser,
    {
      data: registerData, //data key give register user data present in json format
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  // const navigate = useNavigate() is used for programmatic navigation, allowing us to navigate between routes without using <Link> or <NavLink>.
  //  Use useNavigate() when:
  //  1) Navigating based on user actions (button clicks, form submissions, API responses).
  //  2) Redirecting after login/logout.

  const navigate = useNavigate();

  // function and varible which we define in component (above return) will use to make 'dynamic component'. This function and varible used in curly bracket {} in return() when we want to used.

  // when onChange event is active then  'changeInputHandler()' function is call which take event and type as parameter base on parameter type specific method will call.and this specific method add new data in object
  // spread Operator -->  ...
  
   //   Updating a specific field ==> ([name]: value):

  // [name] dynamically sets the property in the object.
// If name is "email", the object becomes { ...previousState, email: value }.
// If name is "password", the object becomes { ...previousState, password: value }.

// ✅ Why use [name]: value?
// Because the same function is used for all fields (name, email, password), and name comes from the input:
// If input has name="email" → it updates signupInput.email
// If input has name="password" → it updates signupInput.password
// If input has name="name" → it updates signupInput.name

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    console.log(inputData);
    const action = type === "signup" ? registerUser : loginUser;
    console.log(action);

    await action(inputData);
  };

  // useeffect take arrow function and array of element as parameter.if any element of arry is changed then arrow function will be called.

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
    }
    if (registerError) {
      toast.error(registerError.data.message || "Signup Failed");
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/");
    }
    if (loginError) {
      toast.error(loginError.data.message || "login Failed");
    }
  }, [
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    loginError,
    registerError,
  ]); 

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="Login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Signup">Signup</TabsTrigger>
          <TabsTrigger value="Login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="Signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg.Mohan"
                  required={true}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  placeholder="Eg.Mohan@gmail.com"
                  onChange={(e) => changeInputHandler(e, "signup")}
                  required={true}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  placeholder="Eg. XYZ"
                  onChange={(e) => changeInputHandler(e, "signup")}
                  required={true}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    please wait
                  </>
                ) : (
                  "signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login your passward here.After signup,you'll be logged in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  placeholder="Eg.Mohan@gmail.com"
                  onChange={(e) => changeInputHandler(e, "login")}
                  required={true}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new"> password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  placeholder="Eg. XYZ"
                  onChange={(e) => changeInputHandler(e, "login")}
                  required={true}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;

// we have a event like onclick,onChange.event take ananomus function in curly bracket {}.we used curly bracket beacuse we write javascript code(dynamic code) in it.

// when we pass any method in event onclick,onChange then we got 'synthetic base event object'.this event object contain all information about what event happen like 'target' which give information about button which we click.

// onChange event --> text box madhe user ne kahi changes kale tar 'onChange' event active hoto.

// { <Button onClick ={()=>handleRegistration("login")}>Login</Button> }

//   In above onClick event we call method ' handleRegistration("login") ' with parameter "login"


// ✅ High-Level Flow (Overview)

// [1] User clicks "Signup" button
//  ↓
// [2] handleRegistration("signup") function runs
//  ↓
// [3] RTK Query's registerUser() function is called with form input
//  ↓
// [4] A POST request is sent to the backend at /api/v1/user/register
//  ↓
// [5] Backend controller receives request, validates & stores data
//  ↓
// [6] Backend responds with success message
//  ↓
// [7] RTK Query stores response in registerData
//  ↓
// [8] useEffect() triggers → toast.success is shown


// ✅ STEP 1,2: handleRegistration("signup") runs

// const handleRegistration = async (type) => {
//   const inputData = type === "signup" ? signupInput : loginInput;
//   const action = type === "signup" ? registerUser : loginUser;
//   await action(inputData); // ✅ registerUser(signupInput)
// };
// It gets the form data (signupInput)
// Calls RTK Query’s mutation hook: registerUser(inputData)

// ✅ STEP 3: RTK Query sends a POST request
// From your authApi.js:

// registerUser: builder.mutation({
//   query: (inputData) => ({
//     url: "register",
//     method: "POST",
//     body: inputData, // JSON: { name, email, password }
//   }),
// }),

// This sends a request to:
// POST http://localhost:8080/api/v1/user/register
// Content-Type: application/json

// {
//   "name": "Nikhil",
//   "email": "nikhil@gmail.com",
//   "password": "123456"
// }

//Now, let’s see how this request is received and processed in your backend Express app.
// ✅ Step-by-step Code Explanation of Backend Flow
// 🔹 server.js or index.js (Main server file)

// import express from "express";
// import userRouter from "./routes/user.routes.js";

// const app = express();

// app.use(express.json()); // ✅ Needed to parse JSON body from client

// app.use("/api/v1/user", userRouter); // All user-related routes
// So:

// Your frontend hits http://localhost:8080/api/v1/user/register

// That matches the route in user.routes.js


//  user.routes.js (Route file)

// import express from "express";
// import { register } from "../controllers/user.controller.js";

// const router = express.Router();

// router.post("/register", register); // 👈 This points to controller

// export default router;

// So:
// When client hits /register via POST, it calls the register controller function.




// ✅ STEP 4: Backend Sends Response

// ✔️ Backend successfully creates user in MongoDB
// ➡️ Now backend needs to send response
// ➡️ RTK Query (in frontend) will receive that response and provide it to your React component

// From your controller:

// return res.status(201).json({
//   success: true,
//   message: "Account created successfully",
// });
// This sends:

// HTTP status: 201 Created

// JSON body:

// {
//   "success": true,
//   "message": "Account created successfully"
// }
// 🔁 This goes back as the HTTP response to the original POST request sent by RTK Query.

// ✅ STEP 5: RTK Query Receives the Response
// You created this RTK query in authApi.js:

// registerUser: builder.mutation({
//   query: (inputData) => ({
//     url: "register",
//     method: "POST",
//     body: inputData,
//   }),
// }),
// When you call it initionally:

// const [registerUser, { data: registerData, isSuccess: registerIsSuccess }] = useRegisterUserMutation();
// RTK Query automatically:

// Waits for the HTTP response
// Parses the JSON body

// Assigns:

// data ➝ the parsed response from backend (i.e., registerData)
// isSuccess ➝ becomes true if status code is 2xx
// error ➝ becomes populated if status code is 4xx/5xx


// ✅ step 6. How RTK Query stores this response:
// When you write:

// const [
//   loginUser,
//   {
//     data: loginData,
//     error: loginError,
//     isLoading: loginIsLoading,
//     isSuccess: loginIsSuccess,
//   },
// ] = useLoginUserMutation();
// These are automatically handled by RTK Query:

// Variable	What it stores
// loginData	✅ Stores response from server (parsed JSON)
// loginError	❌ If request fails (e.g., wrong credentials), stores error object
// loginIsLoading	🔄 Becomes true when request starts, false when done
// loginIsSuccess	✅ Becomes true if server responds with 2xx status


// loginData = {
  // success: true,
//   message: "Login successful",
//   user: {
//     _id: "...",
//     name: "Nikhil",
//     email: "nikhil@gmail.com"
//   }
// }

// loginIsSuccess = true
// loginIsLoading = false
// loginError = undefined


// ✅ Step 7. How useEffect is triggered
// You have:

// useEffect(() => {
//   if (registerIsSuccess && registerData) {
//     toast.success(registerData.message || "Signup successful.");
//   }
//   if (registerError) {
//     toast.error(registerError.data.message || "Signup Failed");
//   }

//   if (loginIsSuccess && loginData) {
//     toast.success(loginData.message || "Login successful.");
//     navigate("/"); // Navigate to home after login
//   }
//   if (loginError) {
//     toast.error(loginError.data.message || "Login Failed");
//   }
// }, [
//   loginIsLoading,
//   registerIsLoading,
//   loginData,
//   registerData,
//   loginError,
//   registerError,
// ]);
// How this works:
// React watches the dependency array:

// [
//   loginIsLoading,
//   registerIsLoading,
//   loginData,
//   registerData,
//   loginError,
//   registerError
// ]
// When any one of these values changes, useEffect() is triggered.
// So when login is successful:
// loginData gets a value → useEffect runs
// loginIsSuccess becomes true → toast.success(...) and navigate("/") are executed

// What Happens When Navigating to /

// Step 7 — createBrowserRouter checks for a matching route:
// path="/" → renders <MainLayout /> (always wraps child routes).

// Step 8 — MainLayout renders:
    // Navbar, Outlet, and any common UI.
    // Outlet loads the child route for /.

// Step 9 — Child route for /:

// <>
//   <HeroSection />
//   <Courses />
// </>
// This is a public route — no ProtectedRoute, so no authentication check here.

// Step 10 — <HeroSection /> and <Courses /> mount.
// If they make API calls, those calls hit backend.
// Backend middleware validates token only if the request needs authentication.


// ✅ If User Navigates to an Admin Page After Login
// Example: /admin/dashboard
// Step 11 — Router matches /admin → element is:

// <AdminRoute>
//   <Sidebar />
// </AdminRoute>


// Step 12 — AdminRoute runs:
// Reads isAuthenticated from Redux.
// If false → <Navigate to="/login" /> (stop here).
// Checks user?.role !== "instructor".
// If not instructor → <Navigate to="/" />.
// If both pass → renders <Sidebar />.

// Step 13 — <Sidebar /> contains <Outlet /> → loads /admin/dashboard → renders <Dashboard />.

// Step 14 — Any data in Dashboard that needs backend → request goes with token → backend role-based middleware may verify if the user is instructor before sending data.