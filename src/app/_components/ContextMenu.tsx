import type { post } from "~/app/_components/interfaces";
import { PiDotsNine } from "react-icons/pi";
import React, { useState } from "react";
import { CiTrash } from "react-icons/ci";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";

interface ContextMenuProps {
  post: post;
  user_id: number | undefined;
}


export default function ContextMenu({ post, user_id }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(user_id === post.author_id);

  function showContextMenu(id: number) {
    setOpen(!open);
  }

  function deletePost() {
    console.log("delete post");
    setOpen(!open);
  }

  function reportPost() {
    console.log("report post");
    setOpen(!open);
  }
  function copyPostLink() {
    console.log("copy post link");
    setOpen(!open);
  }

  return !open ? (
    <PiDotsNine
      className={
        "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
      }
      onClick={() => showContextMenu(post.id)}
    />
  ) : (
    <div className={"relative z-50"}>
      <PiDotsNine
        className={
          "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
        }
        onClick={() => showContextMenu(post.id)}
      />
      <div
        className={
          "absolute right-0 top-[100%] z-10 w-fit min-w-40 select-none rounded-md border border-white bg-black/90 p-4 text-center shadow-lg backdrop-blur-lg transition-opacity duration-300"
        }
      >
        <div
          className={"group flex cursor-pointer flex-row duration-200"}
          onClick={() => deletePost()}
        >
          <div
            className={
              "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-red-500 group-hover:border-red-500"
            }
          >
            <CiTrash className={"hover: mr-1 h-5 w-5"} />
            <span>Delete post</span>
          </div>
        </div>
        <div
          className={"group mt-2 flex cursor-pointer flex-row duration-200"}
          onClick={() => reportPost()}
        >
          <div
            className={
              "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-orange-400 group-hover:border-orange-400"
            }
          >
            <IoWarningOutline className={"hover: mr-1 h-5 w-5"} />
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
