"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import type { AppFileRouter } from "~/app/api/uploadthing/core";
import { FaImages } from "react-icons/fa";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { HiOutlineXMark } from "react-icons/hi2";
import {VscLoading} from "react-icons/vsc";

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
      router.push(`/post/${data[0]?.id}`);
      setContent("");
      setTags("");
      setImageUrls([]);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });

  async function handleSubmit() {
    if (!blockSubmit) {
      if (content !== "") {
        if (content.length > 1250) {
          alert(`Please keep posts under 1250 characters (${content.length})`);
        } else {
          if (content.length < 5) {
            alert("Please add more content before posting");
          } else {
            createPost.mutate({ content, imageUrls, tags });
          }
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
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div
          className="fixed top-0 h-screen w-full pt-32"
          onMouseDown={() => router.back()}
        >
          <div
            className={
              "relative mx-auto w-full rounded-md bg-white/20 p-4 sm:w-96"
            }
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className={
                "group flex w-fit cursor-pointer flex-row border-b border-transparent text-left text-zinc-400 duration-150 hover:border-white/50"
              }
              onClick={() => {
                router.back();
              }}
            >
              <HiOutlineXMark
                className={`h-6 w-6 duration-150 group-hover:text-red-400`}
              />
              <span className={"duration-150 group-hover:text-red-200"}>
                Cancel
              </span>
            </div>
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
              <div>{blockSubmit ? <VscLoading className={"animate-roll w-8 h-8 mx-auto"}/> : "Create post"}</div>
            </button>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
