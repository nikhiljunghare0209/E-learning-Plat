import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";

import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);

  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo)
    }
  },[lecture])

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();

  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  // below is an asynchronous event handler for the file input field.
  // It's triggered when a user selects a file (video) to upload.

  const fileChangeHandler = async (e) => {
    // This gets the first file selected by the user from the file input (<input type="file" />).
    // e.target.files is a FileList, and [0] gets the first uploaded file.
    const file = e.target.files[0];
    // If the user actually selected a file (not canceled), then continue processing.
    if (file) {
      // FormData is used to prepare file data for uploading in a format that the backend can understand (multipart/form-data).
      // You append the file to the FormData object with the key "file" — which matches what your Express backend expects in req.file.
      const formData = new FormData();
      formData.append("file", file);
      // below we Show upload progress UI by setting mediaProgress to true.
      // This triggers the <Progress /> bar to appear on the screen.
      setMediaProgress(true);

      // A POST request is made to your media upload API (/upload-video) using axios.
      // The formData is sent in the body, containing the file.
      // onUploadProgress is a special axios config:
            // It gets called multiple times during upload.
            // It gives loaded (how much is uploaded so far) and total (total file size).
            // We calculate the upload percentage and update uploadProgress, which updates the progress bar in real-time.
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });
        // If the upload is successful, res.data contains the response from your backend.
        // If the response indicates success, we set the uploadVideInfo state with the video URL and public ID.
        // This is used later when creating or editing a lecture.
        // We also enable the button by setting btnDisable to false and show a success toast notification.
        setBtnDisable(false);
        if (res.data.success) {
          console.log(res);
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("video upload failed");
      } 
      // finally block always runs:
      // Hides the progress bar (sets mediaProgress to false)
      finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    console.log({ lectureTitle, uploadVideInfo, isFree, courseId, lectureId });

    await edtiLecture({
      lectureTitle,
      videoInfo: uploadVideInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disbaled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
          />
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch
           checked={isFree} onCheckedChange={setIsFree} 
          id="airplane-mode" />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>

        {mediaProgress && (
          <div className="my-4">
            {/* Progress this is jsx component */}
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <Button  disabled={isLoading} onClick={editLectureHandler}>

          {
                isLoading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Please wait
                </> : "Update Lecture"
              }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
