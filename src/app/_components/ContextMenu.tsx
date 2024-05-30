import type { post } from "~/app/_functions/interfaces";
import { PiDotsNine } from "react-icons/pi";
import React, { useEffect, useRef, useState } from "react";
import { CiEdit, CiTrash } from "react-icons/ci";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { dbDeletePost, dbEditPost, dbReportPost } from "~/server/api/queries";
import { HiOutlineXMark } from "react-icons/hi2";
import { useUserState } from "~/app/_functions/store";

interface ContextMenuProps {
  post: post;
  id: string;
}

export default function ContextMenu({ post, id }: ContextMenuProps) {
  const { user_id } = useUserState((state) => state);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(user_id === post.author_id);

  useEffect(() => {
    setIsAuthor(user_id === post.author_id);
    //eslint-disable-next-line
  }, [user_id]);

  async function editPost() {
    setOpen(!open);
    setEditing(true);
  }

  async function deletePost() {
    setOpen(!open);
    if (isAuthor) {
      const resp = await dbDeletePost(post);
      if (resp === "Deleted") {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      }
    }
  }

  async function reportPost() {
    setOpen(!open);
    if (user_id) {
      const resp = await dbReportPost(post, user_id);
      if (resp === "duplicate") {
        //TODO: Alert duplicate report
      } else {
        //TODO: Alert report created
      }
    } else {
      console.error("Unable to report - no user_id");
    }
  }

  async function copyPostLink() {
    setOpen(!open);
    try {
      await navigator.clipboard.writeText(`https://swe.ing/post/${post.id}`);
      //TODO: Alert text copied successfully
    } catch (error) {
      alert("Your environment does not support the clipboard");
      //TODO: Alert error copying link
    }
  }
  function EditBox() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (editing && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [editing]);

    async function submitEdit() {
      if (isAuthor && textareaRef.current && user_id) {
        const newContent = textareaRef.current.value;
        const resp = await dbEditPost(post, newContent, user_id);
        if (resp) {
          const oldContent = document.getElementById(`${id + "CONTENT"}`);
          if (oldContent) {
            oldContent.innerText = newContent;
            setEditing(false);
            setOpen(false);
          } else {
            //TODO: Alert DOM content not found
            console.warn("DOM content not found");
          }
        }
      } else {
        //TODO: alert no user_id or ref or wtv
        console.warn("No user_id or edit box ref found");
      }
    }

    return (
      <div className={"absolute bottom-10 right-0 h-full w-full  pt-10"}>
        <div
          className={
            "m-0.5 h-full w-screen rounded-md bg-black/70 pr-24 backdrop-blur-md sm:w-fit"
          }
        >
          <textarea
            ref={textareaRef}
            className={
              " z-50 ml-[86px] h-full w-full translate-x-[2.5px] resize-none rounded-md bg-transparent pl-2 pt-1 focus:outline-none"
            }
            defaultValue={post.content}
          ></textarea>
          <div className={"pb-4"}>
            <button
              className={
                "mb-1 h-8 w-full rounded-lg bg-green-700 text-zinc-200 hover:bg-green-600 hover:text-white"
              }
              onMouseDown={() => submitEdit()}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return !open ? (
    editing ? (
      user_id ? (
        <div>
          <HiOutlineXMark
            className={`h-6 w-6  duration-150 hover:text-white motion-safe:hover:scale-[115%] ${isAuthor ? "text-green-400" : "text-zinc-400"}`}
            onMouseDown={() => {
              setEditing(false);
              setOpen(false);
            }}
          />
          <EditBox />
        </div>
      ) : (
        "Loading"
      )
    ) : (
      <PiDotsNine
        className={`h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%] ${isAuthor ? "rounded-sm bg-white/15" : ""}`}
        onMouseDown={() => setOpen(!open)}
      />
    )
  ) : (
    <div className={"relative"}>
      <HiOutlineXMark
        className={
          "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-[115%]"
        }
        onMouseDown={() => setOpen(!open)}
      />
      <div
        className={
          "rounded-context backdrop-blur-xs absolute bottom-7 right-6 z-50 w-fit min-w-40 select-none border border-white bg-black/90 p-4 text-center shadow-lg transition-opacity duration-300"
        }
      >
        {isAuthor ? (
          <div
            className={"group mb-2 flex cursor-pointer flex-row duration-200"}
            onMouseDown={() => deletePost()}
          >
            <div
              className={
                "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-red-500 group-hover:border-red-500"
              }
            >
              <CiTrash className={"mr-1 h-5 w-5"} />
              <span>Delete post</span>
            </div>
          </div>
        ) : null}
        {isAuthor ? (
          <div
            className={"group mb-2 flex cursor-pointer flex-row duration-200"}
            onMouseDown={() => editPost()}
          >
            <div
              className={
                "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-emerald-500 group-hover:border-emerald-500"
              }
            >
              <CiEdit className={"hover: mr-1 h-5 w-5 -translate-x-0.5"} />
              <span>Edit post</span>
            </div>
          </div>
        ) : null}
        <div
          className={"group flex cursor-pointer flex-row duration-200"}
          onMouseDown={() => reportPost()}
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
          onMouseDown={() => copyPostLink()}
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
