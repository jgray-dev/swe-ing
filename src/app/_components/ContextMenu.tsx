import type { post } from "~/app/_components/interfaces";
import { PiDotsNine } from "react-icons/pi";
import React, {useEffect, useState} from "react";
import {CiEdit, CiTrash} from "react-icons/ci";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import {dbDeletePost, dbReportPost} from "~/server/api/queries";
import {HiOutlineXMark} from "react-icons/hi2";

interface ContextMenuProps {
  post: post;
  user_id: number | undefined;
  id: string;
}


export default function ContextMenu({ post, user_id, id }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(user_id === post.author_id);

  useEffect(() => {
    setIsAuthor(user_id === post.author_id)
    //eslint-disable-next-line
  }, []);
  
  
  async function editPost() {
    console.log("edit post", isAuthor)
  }

  async function deletePost() {
    console.log("delete post", isAuthor);
    setOpen(!open);
    if (isAuthor) {
      const resp = await dbDeletePost(post)
      console.log(resp)
      if (resp === "Deleted") {
       const element = document.getElementById(id)
        if (element) {
          element.remove() 
        } else {
          console.error("element is null")
        }
      }
    }
  }

  async function reportPost() {
    setOpen(!open);
    if (user_id) {
      const resp = await dbReportPost(post, user_id)
      if (resp === "duplicate") {
        //TODO: Alert duplicate report
        console.log("duplicate report")
      } else {
        //TODO: Alert report created
        console.log("Report created", resp)
      }
    } else {
      console.error("Unable to report - no user_id")
    }
  }

  async function copyPostLink() {
    setOpen(!open);
    // const textArea = document.createElement("textarea");
    // textArea.value = `https://swe.ing/post/${post.id}`;
    // document.body.appendChild(textArea);
    // textArea.select();
    try {
      await navigator.clipboard.writeText(`https://swe.ing/post/${post.id}`);
      console.log("Text copied to clipboard");
      //TODO: Alert text copied successfully
    } catch (error) {
      alert("Your environment does not support the clipboard");
      //TODO: Alert error copying link
    }
    // document.body.removeChild(textArea);
  }

  return !open ? (
    <PiDotsNine
      className={
        "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
      }
      onClick={() => setOpen(!open)}
    />
  ) : (
    <div className={"relative"}>
      <HiOutlineXMark
        className={
          "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
        }
        onClick={() => setOpen(!open)}
      />
      <div
        className={
          "z-50 absolute right-6 bottom-7 w-fit min-w-40 select-none rounded-context border border-white bg-black/90 p-4 text-center shadow-lg backdrop-blur-xs transition-opacity duration-300"
        }
      >{isAuthor ?
        <div
          className={"group flex cursor-pointer flex-row duration-200 mb-2"}
          onClick={() => deletePost()}
        >
          <div
            className={
              "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-red-500 group-hover:border-red-500"
            }
          >
            <CiTrash className={"hover: mr-1 h-5 w-5"}/>
            <span>Delete post</span>
          </div>
        </div>:null
      }
        {isAuthor ?
          <div
            className={"group flex cursor-pointer flex-row duration-200 mb-2"}
            onClick={() => editPost()}
          >
            <div
              className={
                "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-emerald-500 group-hover:border-emerald-500"
              }
            >
              <CiEdit   className={"hover: mr-1 h-5 w-5 -translate-x-0.5"}/>
              <span>Edit post</span>
            </div>
          </div>:null
        }
        <div
          className={"group flex cursor-pointer flex-row duration-200"}
          onClick={() => reportPost()}
        >
          <div
            className={
              "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-orange-400 group-hover:border-orange-400"
            }
          >
            <IoWarningOutline className={"hover: mr-1 h-5 w-5"}/>
            <span>Report post</span>
          </div>
        </div>
        <div
          className={"group mt-2 flex cursor-pointer flex-row duration-200"}
          onClick={() => copyPostLink()}
        >
          <div
            className={
              "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-white group-hover:border-white"
            }
          >
            <IoIosLink className={"hover: mr-1 h-5 w-5"} />
            <span>Copy link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
