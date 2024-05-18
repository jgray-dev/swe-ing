"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {UploadDropzone} from "@uploadthing/react";
import type {AppFileRouter} from "~/app/api/uploadthing/core";
import {FaImages} from "react-icons/fa";
import {SignedIn, SignedOut} from "@clerk/nextjs";

export default function ClientSide() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);

  
  return (<div>
    <SignedOut>
      <></>
    </SignedOut>
    <SignedIn>
    <div className="fixed top-0 h-screen w-full pt-32" onClick={() => router.back()}>
      <div
        className={"relative mx-auto w-full rounded-md bg-white/20 p-4 sm:w-96"}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div>
          <textarea
            className={
              "h-48 w-full rounded-md bg-black/10 p-2 text-white placeholder-white/60"
            }
            placeholder={"Enter post content here"}
            onChange={(e) => setContent(e.target.value)}
            value={content}
          >
          </textarea>
          <div className={"w-8 h-8 group bg-red-300"}>
            <UploadDropzone<AppFileRouter, "postImageUploader">
              className="absolute z-30 bg-transparent ut-button:hidden ut-allowed-content:hidden ut-upload-icon:hidden ut-label:hidden max-w-12 max-h-12 w-12 h-12 border-0"
              endpoint="postImageUploader"
              onBeforeUploadBegin={(files) => {
                setBlockSubmit(true);
                return files;
              }}
              onUploadError={() => {
                alert(`Error uploading image`);
              }}
              config={{
                mode: "auto",
              }}
              onClientUploadComplete={(res) => {
                setImageUrls(res.map((img)=>img.url))
                console.log(res);
                setBlockSubmit(false)
              }}
            />
            <FaImages className="absolute w-8 h-8 text-white/80 group-hover:text-white duration-100 z-20"/>
          </div>
          
          
        </div>
        <div className={"h-1/2 select-none px-24 text-white"}>
          
        </div>
        <button
          className={`mt-12 mb-4 h-8 w-full select-none rounded-full bg-white/70 font-bold text-black/90 duration-100 hover:bg-white/80 hover:text-black ${blockSubmit ? "cursor-progress" : "cursor-pointer"}`}
        >
          Submit
        </button>
      </div>
    </div>
    </SignedIn>
    </div>
  );
}



// <Uploader<AppFileRouter, "postImageUploader">
//   endpoint="postImageUploader"
//   onBeforeUploadBegin={(files) => {
//     setBlockSubmit(true);
//     return files;
//   }}
//   onUploadError={() => {
//     alert(`Error uploading image`);
//   }}
//   config={{
//     mode: "auto",
//   }}
//   onClientUploadComplete={(res) => {
//     handleImageUpload(res);
//   }}
// ></Uploader>