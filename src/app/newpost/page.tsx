"use client";

import { UploadDropzone } from "~/utils/uploadthing";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";
import type { NextApiRequest } from "next";

export default function NewPost(req: NextApiRequest) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [blockSubmit, setBlockSubmit] = useState(false);

  function successCallback(data: any) {
    console.log(data[0].id);
    router.push(`/post/${data[0].id}`);
  }

  const createPost = api.post.create.useMutation({
    onSuccess: (createdPost) => {
      successCallback(createdPost);
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  async function handleSubmit() {
    if (blockSubmit) {
      alert("Please wait for image upload to complete.");
    } else if (content !== "") {
      console.log("Add to database here:");
      console.log(imageUrls);
      console.log(content);
      //Fill type defs and syntax for creating a post
      createPost.mutate({ content, imageUrls });
    } else {
      alert("Please add content to your post");
    }
  }

  function handleImageUpload(response: { url: string }[]) {
    const urls = response.map((item) => item.url);
    setImageUrls([...imageUrls, ...urls]);
    setBlockSubmit(false);
  }

  return (
    <div className={"h-screen w-screen"}>
      <div
        className="fixed left-0 top-0 h-screen w-screen scroll-auto bg-black/75 backdrop-blur-sm"
        onClick={() => {
          router.back();
        }}
      >
        <div
          className={"mx-auto h-screen w-96 text-center"}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            className="mt-12 w-full cursor-pointer bg-red-500 text-white"
            onClick={() => {
              router.back();
            }}
          >
            CLOSE
          </div>
          <h1>Create new post</h1>
          <textarea
            className="h-48 w-full rounded-md border border-gray-200 bg-black/90 p-4 text-white placeholder-neutral-200"
            value={content}
            placeholder="Write your post here"
            onChange={(e) => setContent(e.target.value)}
          />
          <UploadDropzone
            endpoint="imageUploader"
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
            }}
          />
          <button
            className={`mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${blockSubmit ? "cursor-progress" : "cursor-pointer"}`}
            onClick={() => handleSubmit()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
