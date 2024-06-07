"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { createLike } from "~/server/api/queries";
import { useUserState } from "~/app/_functions/store";

interface LikeButtonProps {
  postId: number;
  dbliked: boolean;
  dblikes: number;
}

export default function LikeButton({
  postId,
  dbliked,
  dblikes,
}: LikeButtonProps): React.ReactElement {
  const [liked, setLiked] = useState(dbliked);
  const [likes, setLikes] = useState(dblikes);
  const { user_id } = useUserState((state) => state);

  async function likePost() {
    if (liked) {
      setLiked(false);
      setLikes(likes - 1);
    } else {
      setLiked(true);
      setLikes(likes + 1);
    }
    void (await createLike(user_id, postId));
  }
  return (
    <div
      className={
        "group flex w-12 min-w-12 max-w-12 cursor-pointer flex-row text-zinc-400"
      }
      onMouseDown={() => likePost()}
    >
      {liked ? (
        <FaHeart className={`mr-1.5 h-6 w-6 text-red-600 duration-150`} />
      ) : (
        <FaRegHeart
          className={`motion-safe:group-hover:animate-shake mr-1.5 h-6 w-6 duration-150 group-hover:text-red-600`}
        />
      )}

      <span
        className={`invisible absolute inline-flex h-6 w-6 -translate-y-0.5 rounded-full ${liked ? "bg-transparent" : "bg-red-400/25"} group-hover:visible group-hover:animate-ping`}
      ></span>
      <span className={"duration-150 group-hover:text-white"}>{likes}</span>
    </div>
  );
}
