// this file comntain initional state

import { createSlice } from "@reduxjs/toolkit";

const initialState={
  user:null,
  isAuthenticated:false //this will check authentication
}


const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
    },
    userLoggedOut:(state) => {
        state.user = null;
        state.isAuthenticated = false;
    }
  },
});

export const {userLoggedIn, userLoggedOut} = authSlice.actions;
export default authSlice.reducer;

// store is collection of slices.
// createSlice is method in "@reduxjs/toolkit" which used to create slice.this method is make object of slice name,slice initional state and reducer.here userLoggedIn and userLoggedOut are two reducer
