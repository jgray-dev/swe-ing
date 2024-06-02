"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { AppFileRouter } from "~/app/api/uploadthing/core";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { VscLoading } from "react-icons/vsc";
import { deleteImage } from "~/server/api/queries";
import Image from "next/image";
import { CiTrash } from "react-icons/ci";

export default function ClientSide() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [buttonText, setButtonText] = useState("Create post");
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [blockSubmit, setBlockSubmit] = useState(false);

  const createPost = api.posts.create.useMutation({
    onSuccess: (data) => {
      if (!data) {
        alert("Erorr creating post");
        return;
      }
      setSubmitting(false);
      setButtonText("Redirecting...");
      setContent("");
      setTags("");
      setImageUrls("");
      router.push(`/post/${data[0]?.id}`);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });

  async function removeImages(key: string[]) {
    void deleteImage(key);
  }

  async function handleSubmit() {
    if (!blockSubmit) {
      if (content !== "") {
        if (content.length > 1250) {
          alert(`Please keep posts under 1250 characters (${content.length})`);
        } else {
          if (content.length < 5) {
            alert("Please add more content before posting");
          } else {
            setSubmitting(true);
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

  async function removeImage(key: string) {
    console.log(key);
    const arr = imageUrls.split(",");
    const index = arr.indexOf(key);
    arr.splice(index, 1);
    setImageUrls(arr.join(","));
    void removeImages([key]);
  }

  async function cancelPost() {
    if (imageUrls) {
      for (const url of imageUrls.split(",")) {
        void (await deleteImage(url));
      }
    }
    router.back();
  }

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div
          className="fixed top-0 h-screen w-full pt-32"
          onMouseDown={() => void cancelPost()}
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
              onMouseDown={() => {
                void cancelPost();
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
                  "min-h-48 w-full rounded-md border border-white/50 bg-black/30 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
                }
                placeholder={"Enter post content here"}
                onChange={(e) => setContent(e.target.value)}
                value={content}
              ></textarea>
              Tags:
              <textarea
                className={
                  "h-16 w-full rounded-md border border-white/50 bg-black/30 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
                }
                placeholder={"Separate tags using ,"}
                onChange={(e) => setTags(e.target.value)}
                value={tags}
              ></textarea>
              <div className={"group h-24 overflow-y-hidden rounded-lg"}>
                <UploadButton<AppFileRouter, "postImageUploader">
                  className="h-24 w-full border-0 duration-150 ut-button:bg-black/70 hover:ut-button:bg-black/80 ut-allowed-content:hidden ut-label:hidden ut-upload-icon:hidden"
                  content={{
                    button({ isUploading }) {
                      if (isUploading) return <div>Uploading...</div>;
                      return <div>Upload images</div>;
                    },
                  }}
                  endpoint="postImageUploader"
                  onBeforeUploadBegin={(files) => {
                    setBlockSubmit(true);
                    return files;
                  }}
                  onUploadError={() => {
                    alert(`Error uploading image.`);
                    setBlockSubmit(false);
                  }}
                  config={{
                    mode: "auto",
                  }}
                  onClientUploadComplete={(res) => {
                    if (imageUrls.split(",").length >= 3) {
                      setBlockSubmit(false);
                      void removeImages(res.map((img) => img.key));
                      alert("You can only upload 3 images");
                      return;
                    }
                    setImageUrls(
                      `${imageUrls ? imageUrls + "," : ""}${res.map((img) => img.key).join(",")}`,
                    );
                    setBlockSubmit(false);
                  }}
                />
              </div>
            </div>
            <div
              className={
                "flex h-1/2 select-none flex-row justify-center text-white"
              }
            >
              {imageUrls ? (
                imageUrls.split(",").map((iurl) => {
                  return (
                    <div
                      key={iurl}
                      className={"group m-2 flex w-1/4 flex-col"}
                      onClick={() => removeImage(iurl)}
                    >
                      <Image
                        src={`https://utfs.io/f/${iurl}`}
                        width={128}
                        height={128}
                        className="object-cover"
                        alt=""
                        sizes="128px"
                      />
                      <div
                        className={
                          "mt-1 flex flex-row text-sm text-zinc-200 duration-150 group-hover:text-red-500"
                        }
                      >
                        <CiTrash className={"mr-1 h-5 w-5"} />
                        Remove
                      </div>
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </div>
            <button
              className={`mb-4 mt-12 h-8 w-full select-none rounded-full bg-white/70 font-bold text-black/90 duration-100 hover:bg-white/80 hover:text-black ${blockSubmit ? "cursor-progress" : "cursor-pointer"}`}
              onMouseDown={() => handleSubmit()}
            >
              <div>
                {blockSubmit ? (
                  <VscLoading className={"animate-roll mx-auto h-8 w-8"} />
                ) : submitting ? (
                  <VscLoading className={"animate-roll mx-auto h-8 w-8"} />
                ) : (
                  `${buttonText}`
                )}
              </div>
            </button>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
