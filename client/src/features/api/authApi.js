// RTK queary ->RTK Query is a powerful data fetching as well as caching solution tool.used to fetch data from server. RTK queary present in Redux Tool kit.
// jeva user login asato teva tyala logout honyachya agodar varanvar database varun data fetch karanachi garaj bhasu naye mhanun apan RTK queary vaparato

// In this file we do API integration means we make connection between front and and backend data
// here,we integrate authApi

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { build } from "vite"
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/";

// fetchBaseQuery() is function present in "@reduxjs/toolkit/query/react" contain object.
// key "baseUrl" ->it contain API end point
// key "endpoints" has value as call back function with parameter 'builder'. we do data post and get using 'builder' parameter.

// builder.mutation -> use when we want to post data on api/server
// builder.queary -> use when we want to get data from api/server
export const authApi = createApi({
  reducerPath: "authApi", //reducer path is same as name
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  // An endpoint in backend development is a specific URL (Uniform Resource Locator) where a client (frontend or another service) can send requests to interact with the backend server or API.

//   An endpoint consists of:
// Base URL (e.g., https://api.example.com)
// Path (e.g., /users)
// Method (e.g., GET, POST, PUT, DELETE) all this method explain in interview notes(notebook)

  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData, //body key ki value me jo data hum bhejane vale he vo rehata he
      }),
      //  when any user is login then we dispatch action using below async function

        // async onQueryStarted(arg, { queryFulfilled, dispatch }) {
         // try {
          // here we dispatch action
         // const result = await queryFulfilled;
         // dispatch(userLoggedIn({ user: result.data.user }));
       // } catch (error) {
        //  console.log(error);
        //}}

      //this function is used to handle the result of the query after it has been executed
      // queryFulfilled is a promise that resolves when the query is successfully executed
      // dispatch is used to send actions to the Redux store
      // here we dispatch userLoggedIn action with the user data received from the server

// | Step | What Happens                                        |
// | ---- | --------------------------------------------------- |
// | ✅ 1  | `loginUser(loginInput)` is called (frontend)        |
// | ✅ 2  | Request goes to **Backend Login Controller**        |
// | ✅ 3  | After successful response → `onQueryStarted()` runs |
// | ✅ 4  | `userLoggedIn()` dispatched to Redux store          |


//   🔹 Step 1: Backend sends successful response
// Let’s say your backend returns:


// {
//   "success": true,
//   "message": "Welcome back Nikhil",
//   "user": {
//     "_id": "123",
//     "name": "Nikhil",
//     "email": "nikhil@gmail.com",
//     "role": "user"
//   }
// }
// This is captured in RTK Query as:

// result.data = {
//   success: true,
//   message: "Welcome back Nikhil",
//   user: {
//     _id: "123",
//     name: "Nikhil",
//     email: "nikhil@gmail.com",
//     role: "user"
//   }
// };

// 🔹 Step 2: queryFulfilled resolves
// Inside onQueryStarted:

// const result = await queryFulfilled;
// This line waits for the server response.

// After receiving the response, result.data.user holds the user object.

// 🔹 Step 3: Dispatch userLoggedIn action

// dispatch(userLoggedIn({ user: result.data.user }));
// This line dispatches this object to Redux:


// {
//   type: 'authSlice/userLoggedIn',
//   payload: {
//     user: {
//       _id: "123",
//       name: "Nikhil",
//       email: "nikhil@gmail.com",
//       role: "user"
//     }
//   }
// }
// 🔹 Step 4: authSlice.reducer handles this action
// The userLoggedIn reducer is triggered:


// userLoggedIn: (state, action) => {
//   state.user = action.payload.user;
//   state.isAuthenticated = true;
// }
// state.user becomes the user object

// state.isAuthenticated = true

// {
//   user: {
//     _id: "123",
//     name: "Nikhil",
//     email: "nikhil@gmail.com",
//     role: "user"
//   },
//   isAuthenticated: true
// }


      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // here we dispatch action
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    logoutUser:builder.mutation({
      query:()=>({
        url:"logout",
        method:"GET"
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // here we dispatch action
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      }
    }),

    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET"
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // here we dispatch action
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
          url:"profile/update",
          method:"PUT",
          body:formData,
          credentials:"include"
      })
  })
  })
});

export const { useRegisterUserMutation, useLoginUserMutation,useLogoutUserMutation,useLoadUserQuery,useUpdateUserMutation } = authApi;


// useRegisterUserMutation and useLoginUserMutation are hook which generate RTK queary using ract library and endpoint object first key




// 1.  Difference if Axios and RTK Query 

// Axios → Only a HTTP client for making API calls (GET, POST, PUT, DELETE).
// RTK Query → A state management tool for server data that:

// Fetches data
// Caches it automatically
// Handles refetching
// Manages loading/error states
// Integrates with Redux out of the box

// 2. Built-in Features in RTK Query
// If you use Axios, you have to manually:
// Store API data in state
// Write loading/error handling
// Prevent duplicate requests
// Handle cache invalidation
// Manage refetching logic

// With RTK Query, you get:

// ✅ Auto Caching — No extra API call if data already exists and is fresh.
// ✅ Automatic Refetching — Data refreshes when needed (e.g., after mutations).
// ✅ Redux Integration — Data is stored in Redux store automatically
// ✅ Loading & Error State — Hooks give you isLoading, isFetching, isError, error without manual tracking.
// ✅ Background Fetching — Updates data without blocking UI.
// ✅ Polling Support — Keep data updated at intervals.

// 3. Example

// Axios Example (Manual Work)

// import axios from "axios";
// import { useState, useEffect } from "react";

// function Users() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     axios.get("/api/users")
//       .then(res => {
//         setUsers(res.data);
//         setLoading(false);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
// }


// RTK Query Example (Minimal Code)

// // apiSlice.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const apiSlice = createApi({
//   reducerPath: 'api',
//   baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
//   endpoints: (builder) => ({
//     getUsers: builder.query({
//       query: () => '/users',
//     }),
//   }),
// });

// export const { useGetUsersQuery } = apiSlice;

// // Users.jsx
// function Users() {
//   const { data: users, isLoading } = useGetUsersQuery();

//   if (isLoading) return <p>Loading...</p>;
//   return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
// }


// With RTK Query — no manual loading state, caching, or error handling code needed.

// 4. When to Choose RTK Query over Axios

// ✅ When:
// Your app uses Redux for state management
// You want caching, refetching, and background updates
// You want less boilerplate for API calls
// You’re making many API requests and want central control

// ❌ You might stick with Axios if:
// You don’t use Redux
// You need only a couple of API calls with no caching logic
// You want total manual control of request/response handling