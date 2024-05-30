import type { comment } from "~/app/_functions/interfaces";
import React from "react";
import { useUserState } from "~/app/_functions/store";
import Link from "next/link";
import Image from "next/image";
import { getTime } from "~/app/_functions/functions";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { HiOutlineXMark } from "react-icons/hi2";
import { deleteCommentDb } from "~/server/api/queries";
import { CiTrash } from "react-icons/ci";

interface CommentCardProps {
  comment: comment;
}
export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const [contextOpen, setContextOpen] = React.useState(false);
  const [commentContext, setCommentContext] = React.useState(<></>);
  const { user_id } = useUserState((state) => state);
  const key = (comment.created_at + comment.post_id) / Math.random();

  async function deleteComment() {
    void (await deleteCommentDb(comment.id));
    location.reload();
  }

  return (
    <div key={key} id={`${key}`} className={"w-full border-b border-white/50 mr-1"}>
      <div className={"flex w-full flex-row py-4"}>
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
            <span className={"text-xs text-zinc-600"}>
              {getTime(comment.created_at)} ago
            </span>
            {user_id === comment.author_id ? (
              contextOpen ? (
                <div
                  className={"mx-auto w-fit"}
                  onMouseDown={() => {
                    setContextOpen(false);
                    setCommentContext(<></>);
                  }}
                >
                  <HiOutlineXMark
                    className={
                      "h-7 w-7 text-zinc-400 duration-200 hover:scale-110 hover:text-red-600"
                    }
                  />
                  {commentContext}
                </div>
              ) : (
                <div
                  className={"mx-auto w-fit"}
                  onMouseDown={() => {
                    setContextOpen(true);
                    setCommentContext(
                      <div
                        className={
                          "rounded-context-comment backdrop-blur-xs absolute left-14 h-8 w-40 -translate-y-3/4 border border-white bg-black/80"
                        }
                      >
                        <div
                          className={
                            "group ml-1 flex flex-row pt-0.5 text-base text-zinc-300 duration-200 hover:text-red-500"
                          }
                          onMouseDown={() => deleteComment()}
                        >
                          <CiTrash className={"mr-1 mt-0.5 h-5 w-5"} />
                          <span>Delete comment</span>
                        </div>
                      </div>,
                    );
                  }}
                >
                  <HiOutlineDotsHorizontal
                    className={
                      "h-7 w-7 text-zinc-400 duration-200 hover:scale-110 hover:text-white"
                    }
                  />
                </div>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className={"p-1 pl-2"}>{comment.content}</div>
      </div>
    </div>
  );
};
