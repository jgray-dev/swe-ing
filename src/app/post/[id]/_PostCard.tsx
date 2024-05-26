"use client";
import React from "react";
import type { post } from "~/app/_functions/interfaces";
import Image from "next/image";
import Link from "next/link";
import { getTime } from "~/app/_functions/functions";
import LikeButton from "~/app/_components/LikeButton";
import { GoCommentDiscussion } from "react-icons/go";
import { CiShare1 } from "react-icons/ci";
import ContextMenu from "~/app/_components/ContextMenu";
import {useUserState} from "~/app/_functions/store";

interface PostCardProps {
  post: post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {user_id} = useUserState(state => state)


  async function sharePost(id: number, title: string) {
    const share = {
      url: `https://swe.ing/post/${id}`,
      title: `${title}`,
    };
    if (!navigator.canShare) {
      alert("Your environment does not support sharing");
    } else {
      await navigator.share(share);
    }
  }

  const liked = post.likes?.some((like) => like.user_id === user_id) ?? false;
  const key = (post.created_at + post.id) / Math.random();
  return (
    <div
      id={`${key}`}
      key={key}
      className={
        "backdrop-blur-xs z-10 my-2 min-h-fit w-[99%] translate-x-[0.5%] border-b-2 border-white/70 bg-black/90 p-1.5 text-zinc-200 duration-300"
      }
    >
      <div className={"flex flex-col"}>
        <div className={"flex h-full min-h-36 w-full flex-row"}>
          <div className={"flex flex-col"}>
            <div
              className={
                "flex w-20 min-w-20 max-w-20 flex-col items-center border-r border-white/50 pr-2 text-xs"
              }
            >
              <div className="relative h-12 w-12 select-none overflow-hidden rounded-full">
                <Link href={`/user/${post.author_id}`}>
                  <Image
                    // @ts-expect-error fuck typescript
                    src={post.author.image_url}
                    fill
                    loading={"lazy"}
                    className="object-cover"
                    alt=""
                    sizes="40px"
                  />
                </Link>
              </div>
              {/*@ts-expect-error fuck typescript*/}
              {post.author.name}
              <br/>
              <span className={"text-xs text-zinc-600"}>
                  {getTime(post.updated_at)} ago
                </span>
            </div>
            <div
              className={
                "mr-1 h-fit min-h-0 w-20 min-w-20 max-w-20 border-r border-t border-white/50"
              }
            >
              <div className={"flex max-h-24 flex-wrap overflow-y-hidden"}>
                {post.post_tags
                  ? post.post_tags.split(",").map((tag) => {
                    if (tag !== "") {
                      return (
                        <Link key={Math.random()} href={`/search/${tag}`}>
                          <div
                            key={Math.random()}
                            className="mx-0.5 ml-0 mt-1 w-fit max-w-20 overflow-x-hidden truncate rounded-sm bg-white/5 p-0.5 text-left text-xs text-zinc-500"
                            title={tag}
                          >
                            {tag}
                          </div>
                        </Link>
                      );
                    } else {
                      return null;
                    }
                  })
                  : null}
              </div>
            </div>
          </div>
          <Link
            key={post.created_at + post.id + Math.random()}
            href={`/post/${post.id}`}
          >
            <div
              id={`${key + "CONTENT"}`}
              className={
                "line-clamp-[10] h-fit max-h-72 min-h-36 min-w-full max-w-full text-wrap break-normal pl-2 text-left"
              }
            >
              {post.content}
            </div>
          </Link>
        </div>
        <div className={"mt-2 border-t border-white/50"}>
          <div
            className={
              "flex select-none flex-row justify-between px-4 pt-1.5"
            }
          >
            <LikeButton
              postId={Number(post.id)}
              dbliked={liked}
              dblikes={post.likes ? post.likes.length : 0}
            />
            <div className={"group flex flex-row text-zinc-400 cursor-pointer"}>
              <Link href={`/post/${post.id}`}>
                <GoCommentDiscussion
                  className={
                    "mr-1.5 h-6 w-6 duration-150 group-hover:text-white motion-safe:group-hover:-translate-y-[5%] motion-safe:group-hover:rotate-3"
                  }
                />
              </Link>
              <span className={"duration-150 group-hover:text-white"}>
                  {post.comments ? post.comments.length : 0}
                </span>
            </div>

            <div className={"cursor-pointer"}>
              <CiShare1
                className={
                  "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:-translate-y-0.5 motion-safe:hover:translate-x-0.5"
                }
                onClick={() => sharePost(post.id, post.content)}
              />
            </div>

            <div className={"cursor-pointer"}>
              <ContextMenu post={post} id={`${key}`}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
