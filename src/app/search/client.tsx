"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { HiOutlineXMark } from "react-icons/hi2";
import {searchEmbeddings} from "~/server/api/queries";

export default function ClientSide() {
  const router = useRouter();
  const [content, setContent] = useState("");

  async function handleSubmit() {
      if (content !== "") {
        if (content.length > 749) {
          alert("Post too long. 749 characters max");
        } else {
          const results = await searchEmbeddings(content)
          console.log(results)
        }
      } else {
        console.warn("No content detected. . .");
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
            <div
              className={
                "group flex flex-row text-left text-zinc-400 border-transparent border-b hover:border-white/50 w-fit duration-150 cursor-pointer"
              }
              onClick={() => {
                router.back();
              }}
            >
              <HiOutlineXMark
                className={`h-6 w-6 group-hover:text-red-400 duration-150`}
                
              />
              <span className={"group-hover:text-red-200 duration-150"}>Cancel</span>
            </div>
            <div className={"text-left"}>
              Search:
              <textarea
                className={
                  "min-h-48 w-full rounded-md border border-white/50 bg-black/10 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
                }
                placeholder={"Enter search query here"}
                onChange={(e) => setContent(e.target.value)}
                value={content}
              ></textarea>
            </div>
            <div className={"h-1/2 select-none px-24 text-white"}></div>
            <button
              className={`mb-4 mt-12 h-8 w-full select-none rounded-full bg-white/70 font-bold text-black/90 duration-100 hover:bg-white/80 hover:text-black cursor-pointer`}
              onClick={() => handleSubmit()}
            >
              <div>Search</div>
            </button>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
