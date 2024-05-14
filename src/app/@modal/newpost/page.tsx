"use client";
import { UploadDropzone } from "~/utils/uploadthing";
import { useState } from "react";

export default function NewPost() {
  const [content, setContent] = useState("");
  return (
    <div
      className="fixed left-0 top-0 h-screen w-screen scroll-auto bg-black/75 backdrop-blur-sm"
      onClick={() => {
        console.log("CLOSE");
      }}
    >
      <div
        className={"mx-auto h-screen w-96 text-center"}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1>Create new post</h1>
        <textarea
          className="h-48 w-full rounded-md border border-gray-200 bg-black/90 p-4 text-white placeholder-neutral-200"
          value={content}
          placeholder="Write your post here"
          onChange={(e) => setContent(e.target.value)}
        />
        <UploadDropzone endpoint="imageUploader" />
        <button
          className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => console.log(content)}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
