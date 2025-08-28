import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import CourseTab from "./CourseTab";

const EditCourse = () => {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-xl">
          Add detail information regarding course
        </h1>
        <Link to="lecture">
          <Button
            className="bg-white text-black border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
            variant="default"
          >
            Add Lectures
          </Button>
        </Link>
      </div>
      <CourseTab />
    </div>
  );
};

export default EditCourse;
