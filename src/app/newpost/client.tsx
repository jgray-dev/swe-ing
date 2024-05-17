"use client"

import {useState} from "react";
import {UploadDropzone} from "@uploadthing/react";
import type {OurFileRouter} from "~/app/api/uploadthing/core";

export default function ClientSide() {
  const [content, setContent] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false)

  function handleImageUpload(response: { url: string }[]) {
    const urls = response.map((item) => item.url);
    setImageUrls([...imageUrls, ...urls]);
    setBlockSubmit(false);
  }
  
  return (
    <div className="w-full">
      <div className={" mx-auto relative w-full sm:w-96 bg-white/30 p-4 rounded-md"}>

        <textarea className={"bg-black/10 w-full h-48 text-white placeholder-white/60 rounded-md p-2"}
                  placeholder={"Enter post content here"} onChange={(e) => setContent(e.target.value)}
                  value={content}></textarea>
        <div>
          
        <UploadDropzone<OurFileRouter, "postImageUploader">
          endpoint="postImageUploader"
          onBeforeUploadBegin={(files) => {
            setBlockSubmit(true);
            return files;
          }}
          onUploadError={() => {
            alert("Error uploading image");
          }}
          config={{
            mode: "auto",
          }}
          onClientUploadComplete={(res) => {
            handleImageUpload(res);
          }}/>
        </div>
        <button className={`bg-white text-black rounded-full h-6 w-full ${blockSubmit ? "cursor-progress" : "cursor-pointer"}`}>Submit</button>
      </div>
    </div>
  )
}