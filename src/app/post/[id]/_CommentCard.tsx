import type { comment } from "~/app/_functions/interfaces";
import React from "react";
import { useUserState } from "~/app/_functions/store";
import Link from "next/link";
import Image from "next/image";
import { getTime } from "~/app/_functions/functions";

interface CommentCardProps {
  comment: comment;
}
export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const { user_id, name, clerk_id } = useUserState((state) => state);
  const key = (comment.created_at + comment.post_id) / Math.random();
  return (
    <div
      key={key}
      id={`${key}`}
      className={"w-full border-b border-white/50 bg-black/80"}
    >
      <div className={"flex w-full flex-row"}>
        <div className={" w-20 min-w-20 max-w-20 text-center"}>
          <div
            className={
              "flex w-20 min-w-20 max-w-20 flex-col items-center border-r border-white/50 pr-2 text-xs"
            }
          >
            <div className="relative h-12 w-12 select-none overflow-hidden rounded-full">
              <Link href={`/user/${comment.author_id}`}>
                <Image
                  src={comment.author.image_url}
                  fill
                  loading={"lazy"}
                  className="object-cover"
                  alt=""
                  sizes="40px"
                />
              </Link>
            </div>
            {comment.author.name}
            <br />
            <span
              className={"text-xs text-zinc-600"}
            >
              {getTime(comment.created_at)} ago
            </span>
          </div>
        </div>
        <div className={"p-1 pl-2"}>{comment.content}</div>
      </div>
      <div className={"w-full bg-red-400/20"}>bnuttonsss</div>
    </div>
  );
};
