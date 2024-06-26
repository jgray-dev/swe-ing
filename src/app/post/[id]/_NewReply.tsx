import { useReplyState, useUserState } from "~/app/_functions/store";
import React, { useState } from "react";
import { VscLoading } from "react-icons/vsc";
import { HiOutlineXMark } from "react-icons/hi2";
import { createComment } from "~/server/api/queries";

// @ts-expect-error fts
export default function NewReply({ closeReply }) {
  const { post_id } = useReplyState((state) => state);
  const [content, setContent] = useState("");
  const [blockSubmit, setBlockSubmit] = useState(false);
  const { user_id } = useUserState((state) => state);

  async function handleSubmit() {
    if (content.length > 5) {
      if (content.length < 750) {
        setBlockSubmit(true);
        const resp = await createComment(user_id, post_id, content);
        if (resp === 0) {
          location.reload();
        } else {
          alert("Error creating comment");
        }
      } else {
        alert(`Max reply length 750 characters (${content.length})`);
      }
    } else {
      alert("Please add more content before replying");
    }
  }

  return (
    <div
      className={
        "backdrop-blur-xs fixed left-0 top-0 z-50 h-full w-full rounded-lg bg-black/80 text-white"
      }
    >
      <div className={"mx-auto h-screen w-screen py-24 sm:w-96"}>
        <div
          className={
            "group flex w-fit cursor-pointer flex-row border-b border-transparent text-left text-zinc-400 duration-150 hover:border-white/50"
          }
          onMouseDown={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            closeReply();
          }}
        >
          <HiOutlineXMark
            className={`h-6 w-6 duration-150 group-hover:text-red-400`}
          />
          <span className={"duration-150 group-hover:text-red-200"}>
            Cancel
          </span>
        </div>
        Reply to post {post_id}
        <textarea
          className={
            "min-h-48 w-full rounded-md border border-white/50 bg-black/10 p-2 text-white placeholder-white/60 outline-none focus:border-white/80 focus:outline-none"
          }
          placeholder={"Enter reply here"}
          onChange={(e) => setContent(e.target.value)}
          value={content}
        ></textarea>
        <button
          className={`mb-4 mt-12 h-8 w-full cursor-pointer select-none rounded-full bg-white/70 font-bold text-black/90 duration-100 hover:bg-white/80 hover:text-black`}
          onMouseDown={() => handleSubmit()}
        >
          <div>
            {blockSubmit ? (
              <VscLoading className={"animate-roll mx-auto h-8 w-8"} />
            ) : (
              "Reply"
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
