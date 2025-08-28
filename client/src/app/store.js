
import { configureStore } from "@reduxjs/toolkit";
import rootRedcuer from "./rootReducer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

// 1️⃣ What is a store in Redux Toolkit (RTK)?
// Think of the store like a “central brain” of your frontend app.
// It stores the state of your entire application in one place.
// Any part of your React app can read from it or update it.
// Redux Toolkit just gives you an easier, less-boilerplate way to create and manage this store.

// 2️⃣ What is configureStore in Redux Toolkit (RTK)?
// configureStore is a function provided by Redux Toolkit that simplifies the process of creating a Redux store.
// It automatically sets up the store with good defaults, like enabling Redux DevTools and adding middleware for handling asynchronous actions.
// You can also customize it by adding your own reducers and middleware.

// 3️⃣ What is the purpose of the middleware in Redux Toolkit (RTK)?
// Middleware in Redux Toolkit is like a middleman that can intercept actions before they reach the reducers.
// It allows you to add extra functionality, like logging actions, handling asynchronous requests, or modifying actions.
// In this case, we are adding the middleware for the APIs defined in authApi, courseApi, purchaseApi, and courseProgressApi.

// 
export const appStore=configureStore({
  reducer:rootRedcuer,
  middleware:(defaultMiddleware)=>defaultMiddleware().concat(authApi.middleware,courseApi.middleware,purchaseApi.middleware,courseProgressApi.middleware)  //this is default line in RTK queary.this show that defaultMiddleware() is middleware array where we add new middleware authApi.middleware
})

// when user will refresh webpage then user data will be undefine.hence,below code will run every time after refreshment of webpage.therefor user data prsent in webpage.

// When user do refresh then 'authApi.endpoints.loadUser' this path will hit.
///When the user refreshes after login
//The store is empty again (Redux state lives in memory, so it’s wiped).
//Your initializeApp() function immediately dispatches loadUser API request.
//The middleware fetches the user data, puts it back into the store, and the UI updates.
const initializeApp=async()=>{
  await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
}

initializeApp();


