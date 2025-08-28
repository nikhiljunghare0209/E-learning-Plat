import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

// useGetCourseLectureQuery(courseId) is a React Hook, and hooks are run at the top level of the component,
// This is a React hook provided by RTK Query.
// When your "CreateLecture" component renders, React runs this hook.
// RTK Query internally sends a network request to fetch lectures using the courseId.
// The returned values (lectureData, lectureLoading, etc.) are automatically updated based on the request status.

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const createLectureHandler = async () => {
    await createLecture({ lectureTitle, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);
  console.log(lectureData);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add lectures, add some basic details for your new lecture
        </h1>
        <p className="text-sm">
          First select lecture title, then you can add more details like
          description, video, and more in the next step.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your Title Name"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            // The navigate function from react-router-dom handles client-side routing. This means:
            // React will update the browser URL to /admin/course/${courseId}.
            // React Router will look for a matching route (defined in your route setup, usually in App.jsx or Routes.jsx) and render the corresponding component (JSX file) without reloading the page and also execute controller of that path.
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create Lecture"
            )}
          </Button>
        </div>
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures.</p>
          ) : lectureData.lectures.length === 0 ? (
            <p>No lectures availabe</p>
          ) : (
            lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
