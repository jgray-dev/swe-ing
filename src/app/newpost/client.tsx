"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import type { AppFileRouter } from "~/app/api/uploadthing/core";
import { FaImages } from "react-icons/fa";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {api} from "~/trpc/react";

export default function ClientSide() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);
  
  
  const createPost = api.posts.create.useMutation({
    onSuccess: (data) => {
      setContent("")
      setImageUrls([])
      router.push(`/post/${data[0]?.id}`)
    },
    onError: (err) => {
      console.error(err.message);
    },
  });
  
  function handleSubmit() {
    if (!blockSubmit) {
      if (content !== "") {
        console.log("Meow");
        console.log(content);
        console.log(imageUrls.length > 0 ? imageUrls : "No URLS");
        createPost.mutate({ content, imageUrls });
      } else {
        console.warn("No content detected. . .");
      }
    } else {
      console.warn("Images are still uploading. . .");
    }
  }

  return (
    <div>
      <SignedOut>
        <></>
      </SignedOut>
      <SignedIn>
        <div
          className="fixed top-0 h-screen w-full pt-32"
          onClick={() => router.back()}
        >
          <div
            className={
              "relative mx-auto w-full rounded-md bg-white/20 p-4 sm:w-96"
            }
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
              ></textarea>
              <div className={"group h-8 w-8"}>
                <UploadDropzone<AppFileRouter, "postImageUploader">
                  className="ut-button:hidden ut-allowed-content:hidden ut-upload-icon:hidden ut-label:hidden absolute z-30 h-6 max-h-12 w-12 max-w-12 border-0 bg-transparent"
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
                    setImageUrls(res.map((img) => img.url));
                    console.log(res);
                    setBlockSubmit(false);
                  }}
                />
                <FaImages className="absolute z-20 h-8 w-8 text-white/80 duration-200 group-hover:text-white" />
              </div>
            </div>
            <div className={"h-1/2 select-none px-24 text-white"}></div>
            <button
              className={`mb-4 mt-12 h-8 w-full select-none rounded-full bg-white/70 font-bold text-black/90 duration-100 hover:bg-white/80 hover:text-black ${blockSubmit ? "cursor-progress" : "cursor-pointer"}`}
              onClick={() => handleSubmit()}
            >
              Create post
            </button>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}