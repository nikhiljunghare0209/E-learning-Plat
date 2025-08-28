import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  // here we call useLoadUserQuery() to get data of user profile from backend.
  const { data, isLoading, refetch } = useLoadUserQuery();
  console.log(data);

//   ✅ Step-by-Step Explanation how below " useUpdateUserMutation()" works:
// 🔹 Step 1: You call the mutation

// await updateUser(formData);
// This sends the formData (name + image) to the backend controller.

// 🔹 Step 2: RTK Query handles the response
// Behind the scenes:

// RTK Query handles success and error internally.
// Then it sets the following state flags:

// isSuccess = true (if update succeeded)
// isError = true (if update failed)
// updateUserData = response data from the controller
// error = error details if failed

// 🔹 Step 3: useEffect gets triggered
// Because isSuccess, isError, updateUserData, or error changed, the useEffect runs.

// 🔹 Step 4: if (isSuccess) block

// if (isSuccess) {
//   refetch();
//   toast.success(data.message || "Profile updated.");
// }
// refetch() → Triggers useLoadUserQuery() again to get the updated profile data.

// 🔁 Why does refetch() trigger only useLoadUserQuery() again and not any other mutation or query?
// 📍 You have this line in your component:

// const { data, isLoading, refetch } = useLoadUserQuery();
// refetch is a function scoped only to useLoadUserQuery.
// It only re-runs the "GET /profile" request.

// ✅ Why we want to use refetch() here
// After the profile is updated:
// You want to get fresh user data from the server.
// So you call refetch() on the same query that initially fetched the profile (useLoadUserQuery).
// This triggers the backend API again, and brings fresh user.name, photoUrl, etc.


// toast.success(...) → Shows a green popup message.

// ⚠️ Issue in your code:
// You’re reading data.message, but data here is from the original useLoadUserQuery() (not the update response). You should read:

// toast.success(updateUserData?.message || "Profile updated.");
// ✅ Fix:

// if (isSuccess) {
//   refetch();
//   toast.success(updateUserData?.message || "Profile updated.");
// }

  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();
// ✅ Step-by-Step Execution of below function "onChangeHandler( )":
// 🔹 Step 1: User clicks on the file input field

// <input type="file" />
// This opens the system's file explorer so the user can pick an image.

// 🔹 Step 2: User selects an image
// When the user picks a file, the onChange event is triggered.
// That file is stored in the event object (e) under e.target.files.


// e.target.files[0]  // contains the first selected file
// e.target.files is a FileList object (like an array), even if one file is selected.

// 🔹 Step 3: onChangeHandler is called

// const onChangeHandler = (e) => {
//   const file = e.target.files?.[0]; // get the first (only) file
//   if (file) setProfilePhoto(file);  // store it in state
// };
// 🔸 What this does:
// Safely gets the first file using optional chaining (?.[0])
// Checks if a file exists
// Calls setProfilePhoto(file) to save the file in React state

// Now the variable profilePhoto (your state variable) holds the selected image file object.
// 📂 What is inside file?

// {
//   name: "photo.png",
//   size: 23456,
//   type: "image/png",
//   lastModified: 1691234567890,
//   ...
// }
// 🔹 Step 4: Later used in FormData
// When the user clicks "Save Changes", this file is sent to the server:

// const formData = new FormData();
// formData.append("name", name);
// formData.append("profilePhoto", profilePhoto);
// await updateUser(formData);
// ✅ This formData now contains:

// "name" as plain text
// "profilePhoto" as a file (image binary)


// ✅ Why FormData is used?
// 🔸 Normal JSON (what we usually send in APIs):
// {
//   name: "Nikhil",
//   profilePhoto: [object File] ❌
// }
// JSON works fine for text.
// But if you try to send a file inside a JSON object, it either becomes unreadable or corrupted.
// Express (Node.js) will not be able to parse the file unless it's in multipart/form-data format.

// ✅ What is FormData?
// FormData is a special JavaScript object that lets you:
// Combine files and text fields into one request.
// Automatically sets the Content-Type: multipart/form-data.
// Helps the browser and server handle binary data (like images)

// This is how you send files from frontend to backend in a multipart form.

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    // we send file hence we use form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    await updateUser(formData);
  };

  // below useEffect used to refetch profile
  useEffect(() => {
    refetch();
  }, []);
  // below useEffect used to display message after updation
  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError]);

  if (isLoading) return <h1>Profile loading</h1>;


// below statement ensures:
// If data exists → get data.user
// If data is undefined → don’t try to access data.user

// 🔹 Why both data and data.user?
// ✅ data
// Comes from this line:


// const { data } = useLoadUserQuery();
// It holds the response returned from the API. Example:

// data = {
//   success: true,
//   user: {
//     name: "Nikhil",
//     email: "nikhil@example.com",
//     role: "student",
//     ...
//   }
// }
// ✅ data.user
// This extracts just the user object from the data.

  const user = data && data.user;

  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="font-bold text-2xl text-center md:text-left">Profile</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Name:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.name}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Email:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.email}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Role:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.role.toUpperCase()}
              </span>
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">
                Edite Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={user.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  />
                </div>
                {/*try  */}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Role</Label>
                  <Input
                    type="text"
                    value={user.role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  />
                </div>

                {/* end */}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                >
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      Wait
                    </>
                  ) : (
                    "Save Change"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <h1 className="font-medium text-lg">Courses you are enrolled in</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
          {user.enrolledCourses.length === 0 ? (
            <h1>you haven't enrolled yet</h1>
          ) : (
            user.enrolledCourses.map((course) => (
              <Course course={course} key={course._id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
