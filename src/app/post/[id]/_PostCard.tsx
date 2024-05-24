"use client";
import React, { useEffect, useState } from "react";
import type { post, user } from "~/app/_functions/interfaces";
import Image from "next/image";
import Link from "next/link";
import { getTime } from "~/app/_functions/functions";
import LikeButton from "~/app/_components/LikeButton";
import { GoCommentDiscussion } from "react-icons/go";
import { CiShare1 } from "react-icons/ci";
import ContextMenu from "~/app/_components/ContextMenu";
import { useUser } from "@clerk/shared/react";
import { getDbUser } from "~/server/api/queries";

interface PostCardProps {
  post: post;
  user_id: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, user_id }) => {
  const [userId, setUserId] = useState<number>();


  async function getCurrentUser() {
    const dbUser = await getDbUser(user_id);
    setUserId(dbUser?.id);
  }

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

  useEffect(() => {
    void getCurrentUser();
  }, []);

  function likePost() {
    //send query to db
    //update dom based on state
  }

  const liked = post.likes?.some((like) => like.user_id === userId) ?? false;
  const key = (post.created_at + post.id) / Math.random();
  return (
    <div className={"h-56 max-h-96 min-h-56 w-full"} key={"key"}>
      <div className={"flex h-full w-full flex-col"}>
        <div className={"bg-red-400/20"}>
          <div className={"flex flex-row"}>
            <div className={"bg-blue-400/20"}>
              <div className={"flex flex-col"}>
                <div
                  className={
                    "w-20 min-w-20 max-w-20 bg-orange-300/20 text-center"
                  }
                >
                  <div className="relative mx-auto h-12 w-12 select-none overflow-hidden rounded-full">
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
                  <span className={"w-full text-center"}>
                    {/*@ts-expect-error fuck typescript*/}
                    {post.author.name}
                    <br />
                    <span className={"text-xs text-zinc-400"}>
                      {getTime(post.updated_at)} ago
                    </span>
                  </span>
                </div>
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
            <div
              className={
                "line-clamp-[10] h-fit max-h-72 min-h-36 min-w-full max-w-full overflow-ellipsis text-wrap  break-normal bg-purple-700 p-2 pr-[88px] text-left"
              }
            >
              {post.content}
            </div>
          </div>
        </div>
        <div
          className={"flex select-none flex-row justify-between px-4 pt-1.5"}
        >
          <LikeButton
            postId={Number(post.id)}
            dbliked={liked}
            dblikes={post.likes ? post.likes.length : 0}
          />
          <div className={"group flex cursor-pointer flex-row text-zinc-400"}>
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
            <ContextMenu post={post} user_id={userId} id={`${key}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
