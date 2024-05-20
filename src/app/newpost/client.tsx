"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import type { AppFileRouter } from "~/app/api/uploadthing/core";
import { FaImages } from "react-icons/fa";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export default function ClientSide() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);

  const createPost = api.posts.create.useMutation({
    onSuccess: (data) => {
      if (!data) {
        alert("Erorr creating post");
        return;
      }
      setContent("");
      setImageUrls([]);
      router.push(`/post/${data[0]?.id}`);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });

  function handleSubmit() {
    if (!blockSubmit) {
      if (content !== "") {
        if (content.length > 749) {
          alert("Post too long. 749 characters max");
        } else {
          createPost.mutate({ content, imageUrls, tags });
        }
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
            <div className={"text-left"}>
              Post:
              <textarea
                className={
                  "min-h-48 w-full rounded-md border border-white/50 bg-black/10 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
                }
                placeholder={"Enter post content here"}
                onChange={(e) => setContent(e.target.value)}
                value={content}
              ></textarea>
              Tags:
              <textarea
                className={
                  "h-16 w-full rounded-md border border-white/50 bg-black/10 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
                }
                placeholder={"Separate tags using ,"}
                onChange={(e) => setTags(e.target.value)}
                value={tags}
              ></textarea>
              <div className={"group h-8 w-8"}>
                <UploadDropzone<AppFileRouter, "postImageUploader">
                  className="absolute z-30 h-6 max-h-12 w-12 max-w-12 border-0 bg-transparent ut-button:hidden ut-allowed-content:hidden ut-label:hidden ut-upload-icon:hidden"
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
