import type { post } from "~/app/_functions/interfaces";
import { PiDotsNine } from "react-icons/pi";
import React, { useEffect, useRef, useState } from "react";
import { CiEdit, CiTrash } from "react-icons/ci";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import {
  dbDeletePost,
  dbEditPost,
  dbReportPost,
  deleteImage,
} from "~/server/api/queries";
import { HiOutlineXMark } from "react-icons/hi2";
import { useAlertState, useUserState } from "~/app/_functions/store";
import Image from "next/image";

interface ContextMenuProps {
  post: post;
  id: string;
  postPage: boolean;
}

export default function ContextMenu({ post, id, postPage }: ContextMenuProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const setAlert = useAlertState((state) => state.setAlert);
  const { user_id, permission } = useUserState((state) => state);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [newImageUrls, setNewImageUrls] = useState(post.image_urls);
  const [removeUrls, setRemoveUrls] = useState("");
  const [isAuthor, setIsAuthor] = useState(user_id === post.author_id);
  const [isSuperior] = useState(post.author ? permission >= post.author.permission && post.author.permission > 0 : false);

  useEffect(() => {
    setIsAuthor(user_id === post.author_id);
    //eslint-disable-next-line
  }, [user_id]);

  useEffect(() => {
    setNewImageUrls(post.image_urls);
    setRemoveUrls("");
    //eslint-disable-next-line
  }, [editing]);

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
          location.reload();
        }
      }
    }
  }

  async function reportPost() {
    setOpen(!open);
    if (user_id) {
      const resp = await dbReportPost(post, user_id);
      if (resp === "duplicate") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setAlert({ text: "You've already reported this post", type: "warn" });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setAlert({ text: "Post reported successfully", type: "info" });
      }
    } else {
      console.error("Unable to report - no user_id");
    }
  }

  async function copyPostLink() {
    setOpen(!open);
    try {
      await navigator.clipboard.writeText(`https://swe.ing/post/${post.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "Link copied", type: "info" });
    } catch (error) {
      alert("Your environment does not support the clipboard");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "Unsupported environment", type: "error" });
    }
  }

  function reAddImage(key: string) {
    const arr = removeUrls?.split(",").filter(Boolean);
    const index = arr.indexOf(key);
    if (index !== -1) {
      arr.splice(index, 1);
      setRemoveUrls(arr.join(","));
      // Add the removed image to a new state
      const oldNewImageUrls = newImageUrls.split(",").filter(Boolean);
      oldNewImageUrls.push(key);
      setNewImageUrls(oldNewImageUrls.join(","));
    }
  }

  function removeImageFromPost(key: string) {
    const arr = newImageUrls.split(",").filter(Boolean);
    const index = arr.indexOf(key);
    if (index !== -1) {
      arr.splice(index, 1);
      setNewImageUrls(arr.join(","));
      // Add the removed image to a new state
      const oldRemoved = removeUrls.split(",").filter(Boolean);
      oldRemoved.push(key);
      setRemoveUrls(oldRemoved.join(","));
    }
  }

  function ImageEditor() {
    if (post.image_urls) {
      const arr = post.image_urls.split(",");
      return (
        <div className={"flex h-[100%] w-[120%] flex-row"}>
          {arr.map((iurl) => {
            const removing = removeUrls?.includes(iurl);
            return (
              <div
                key={iurl}
                className={"group m-2 flex w-1/4 flex-col"}
                onMouseDown={() => {
                  if (removing) {
                    reAddImage(iurl);
                  } else {
                    removeImageFromPost(iurl);
                  }
                }}
              >
                <Image
                  src={`https://utfs.io/f/${iurl}`}
                  width={128}
                  height={128}
                  className={`object-cover ${removing ? "grayscale" : "grayscale-0"}`}
                  alt=""
                  sizes="128px"
                />
              </div>
            );
          })}
        </div>
      );
    }
  }

  function EditBox() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (editing && textareaRef.current) {
        textareaRef.current.focus();
      }
      //eslint-disable-next-line
    }, [editing]);

    async function submitEdit() {
      if (isAuthor && textareaRef.current && user_id) {
        const newContent = textareaRef.current.value;
        const resp = await dbEditPost(post, newContent, user_id, newImageUrls);
        if (resp) {
          const oldContent = document.getElementById(`${id + "CONTENT"}`);
          if (oldContent) {
            oldContent.innerText = newContent;
            setEditing(false);
            setOpen(false);
            post.image_urls = newImageUrls;
            for (const url of removeUrls.split(",")) {
              const element = document.getElementById(url);
              if (element) {
                element.remove();
              }
            }
            void deleteImage(removeUrls);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            setAlert({ text: "Post not found on page", type: "warn" });
            console.warn("DOM content not found");
          }
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setAlert({
          text: "No user_id || edit box reference found",
          type: "error",
        });
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
              " z-50 ml-[86px] h-[70%] w-full translate-x-[2.5px] resize-none rounded-md bg-transparent pl-2 pt-1 focus:outline-none"
            }
            defaultValue={post.content}
          ></textarea>
          <div className={"h-[30%]"}>
            <ImageEditor />
          </div>
          <div className={"pb-4"}>
            <button
              className={
                "bottom-0 mb-1 h-8 w-full rounded-lg bg-green-700 text-zinc-200 hover:bg-green-600 hover:text-white"
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
            className={`h-6 w-6 text-zinc-200 duration-150 hover:text-red-600 motion-safe:hover:scale-[115%]`}
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
        {isSuperior ? (
          <div
            className={"group mb-2 flex cursor-pointer flex-row duration-200"}
            onMouseDown={() => {console.log("GOT PERMS")}}
          >
            <div
              className={
                "group flex flex-row border-b border-transparent text-zinc-300 duration-200 hover:text-emerald-500 group-hover:border-emerald-500"
              }
            >
              <CiEdit className={"hover: mr-1 h-5 w-5 -translate-x-0.5"} />
              <span>U GOT PERMS</span>
            </div>
          </div>
        ) : (
          <></>
        )}
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
        {isAuthor && postPage ? (
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
