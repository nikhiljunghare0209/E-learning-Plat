import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";


// 1️⃣ Function definition
// export const ProtectedRoute = ({ children }) => { ... }
// It’s an arrow function component.
// The { children } means this component will receive whatever you put inside it when you use it.
// For example, in App.jsx:
    // <ProtectedRoute>
    //   <MyLearning />
    // </ProtectedRoute>
// Here, children will be <MyLearning />.

// 2️⃣ Getting state from Redux
// const { isAuthenticated } = useSelector(store => store.auth);
// useSelector reads data from your Redux store.
// It takes the entire store (store) and returns only store.auth.isAuthenticated.
// isAuthenticated is a boolean (true = logged in, false = not logged in).

// 3️⃣ The protection logic
     
// If isAuthenticated is false:
// The user is not logged in.
// Immediately returns <Navigate to="/login" /> → redirects them to the login page.
// hence,The children component is never rendered.

    // if (!isAuthenticated) {
    //     return <Navigate to="/login" />;
    // }

// 4️⃣ Showing the protected content

// If isAuthenticated is true:
// The user is logged in.
// Return children → the protected component (like <MyLearning />) gets rendered.

// return children;

// 5️⃣ In plain English

// ProtectedRoute says:
// “If you’re logged in, I’ll show you the private page.
// If you’re not logged in, I’ll send you to /login.”

export const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    return children;
}

// ✅ Why you need AuthenticatedUser ?

// AuthenticatedUser function code say's “If you are already logged in, you can’t see the login page — I’ll send you to the homepage instead.”

// Without AuthenticatedUser,
// Logged-in users could still type " /login " in the address bar and see the login form again, which doesn’t make sense.
// This wrapper protects the login page so only unauthenticated users can visit it.

// Explanation of AuthenticatedUser function:
    
//✅ 1. children
   // In React, anything you put between a component’s opening and closing tags becomes its children prop.
     // ex.from App.jsx
     // <AuthenticatedUser>
     //   <Login />  {/* <-- this is `children` */} 
     // </AuthenticatedUser>
   // Here, children will be the <Login /> page

// ✅ 2.useSelector (from react-redux)
    // A hook to read data from the Redux store.
    // You pass it a selector function; it receives the whole store state and returns whatever piece you need.
      // ex.const { isAuthenticated } = useSelector((store) => store.auth);
   // This means: “From the Redux state, give me the auth slice, and from it, the isAuthenticated value.”
   // It automatically re-runs and re-renders the component when that selected piece of state changes.

// ✅ 3.store.auth
     // This assumes your root reducer has an auth slice (e.g. combineReducers({ auth: authReducer, ... })).
     // That slice holds things like isAuthenticated, user, maybe loading, etc. It’s updated by your login/logout actions or your RTK Query loadUser init.
     // here "isAuthenticated" is a A boolean flag in your auth slice that says whether the user is logged in.
     // Typical lifecycle: 
        // Initially false.
        // After successful login or loadUser succeeds → set to true.
        // On logout → set back to false.

// ✅ 4.after getting isAuthenticated value we do conditional rendering:
    // If isAuthenticated === true → it returns <Navigate to="/" />, so the user is redirected and never sees the login page.
    // If isAuthenticated === false → it returns children, which is <Login />, so the login page is shown.
export const AuthenticatedUser = ({children}) => {
    const {isAuthenticated} = useSelector(store=>store.auth);


    if(isAuthenticated){
        return <Navigate to="/"/>
    }

    return children;
}

//In Below function
// 1️⃣ What it is
// export const AdminRoute = ({ children }) => { ... }
// in above This is a special route guard for admin-only pages.
// It decides who can see certain pages based on:
// Whether they are logged in.
// Whether their role is "instructor".

// 2️⃣ from below code we are Getting state from Redux
// const { user, isAuthenticated } = useSelector(store => store.auth);
// useSelector reads from the Redux store.
// and From store.auth it grabs:
     // isAuthenticated → Boolean (true if logged in, false if not).
     // user → Object with user details (like name, email, role, etc.).

// Example:

// user = {
//   name: "John Doe",
//   email: "john@example.com",
//   role: "instructor"
// }

// 3️⃣ First check → Logged in?
// If the user is not logged in:
// Redirect to /login.
// The children component never runs.
   // if (!isAuthenticated) {
   //     return <Navigate to="/login" />;
   // }


// 4️⃣ Second check → Role is instructor?
// user?.role uses optional chaining (?.) to avoid errors if user is null or undefined.
// If the user’s role is not "instructor":
// Redirect to / (homepage).
// This blocks logged-in students from seeing admin's pages.
   // if (user?.role !== "instructor") {
   //     return <Navigate to="/" />;
   // }


// 5️⃣ Show admin content

// If both checks pass:
// User is logged in and has role === "instructor".
// Show whatever was wrapped inside <AdminRoute> (the admin page).
   // return children;


// 6️⃣ Example in your router
// {
//   path: "admin",
//   element: (
//     <AdminRoute>
//       <Sidebar />
//     </AdminRoute>
//   ),
//   children: [
//     { path: "dashboard", element: <Dashboard /> },
//     { path: "course", element: <CourseTable /> }
//   ]
// }


// Visiting /admin/dashboard:
// If not logged in → redirect to /login.
// If logged in but role is "student" → redirect to /.
// If logged in & role is "instructor" → show <Sidebar /> + dashboard.

// 💡 In plain English:
// below function says that -> “Only logged-in users with the instructor role can see this page. Everyone else goes somewhere else.”

export const AdminRoute = ({children}) => {
    const {user, isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    if(user?.role !== "instructor"){
        return <Navigate to="/"/>
    }

    return children;
}



// when we click on login then below process happen step by step. at step 7 our above function run and if we add admin detail correct during login then it redirect us to admin dashboard at path (/admin/dashboard.).

// Step 1 — User clicks Login button.
// Step 2 — RTK Query mutation sends login request.
// Step 3 — Server validates credentials and returns token + user info.
// Step 4 — Redux store updates isAuthenticated and user data.
// Step 5 — Token stored locally for session persistence.
// Step 6 — Navigate to /admin/dashboard.
// Step 7 — AdminRoute checks authentication and role.
// Step 8 — Dashboard renders and loads admin-only data.