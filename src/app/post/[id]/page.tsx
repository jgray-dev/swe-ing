"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/shared/react";
import { getDbUser, nextPostPage, singlePost } from "~/server/api/queries";
import { PostCard } from "~/app/post/[id]/_PostCard";
import type { comment, post } from "~/app/_functions/interfaces";
import { CommentCard } from "~/app/post/[id]/_CommentCard";
import { VscLoading } from "react-icons/vsc";
import NewReply from "~/app/post/[id]/_NewReply";
import {useReplyState} from "~/app/_functions/store";

export default function PostPage({ params }: { params: { id: string } }) {
  const [postId, setPostId] = useState<number>(Number(params.id));
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(true);
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState(false);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const { user } = useUser();
  const [commentCards, setCommentCards] = useState<React.ReactElement[]>([]);
  const [postCard, setPostCard] = useState<React.ReactElement>(<VscLoading className={"animate-roll w-10 h-10 mx-auto"} />);
  //setReplyData
  const {setReplyData} = useReplyState(state => state)
  
  
  function commentOnPost() {
    setReplyData({post_id: Number(postId)})
    setReply(true)
    console.log("user wants to comment :P");
  }

  async function getPost() {
    const pagePost = await singlePost(postId);
    setPostCard(<PostCard post={pagePost as post} />);
  }

  async function getUser() {
    if (user?.id) {
      const dbUser = await getDbUser(user.id);
      if (dbUser?.id) {
        setUserId(dbUser.id);
        void getPost();
      }
    }
  }

  useEffect(() => {
    void getUser();
    setPostId(Number(params.id));
    //eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    console.log("useEffect getComment");
    void getComments();
    //eslint-disable-next-line
  }, [page]);

  async function getComments(user_id?: number) {
    if (userId) {
      user_id = userId;
    }
    const newData = await nextPostPage(page, postId);
    if (newData.length == 0) {
      setEnd(true);
      setLoading(true);
      console.warn("End of comments");
    } else {
      setLoading(false);
      console.log(newData);
      // @ts-expect-error fts
      const newCards = getCommentCards(newData, user_id);
      setCommentCards(newCards);
      console.log("Newdata fetched", newData);
    }
  }

  //Comments infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 1250 && !loading) {
        setLoading(true);
        setPage((prevPage) => prevPage + 1);
      }
    };
    const div = document.getElementById("scrolls");
    div?.addEventListener("scroll", handleScroll);
    if (end) {
      div?.removeEventListener("scroll", handleScroll);
    }
    return () => {
      div?.removeEventListener("scroll", handleScroll);
    };
    //eslint-disable-next-line
  }, [loading]);

  function getCommentCards(comments: comment[]) {
    return comments.map((comment) => {
      console.log(comment);
      return (
        <div key={comment.created_at / Math.random()}>
          <CommentCard comment={comment} />
        </div>
      );
    });
  }

  return (
    <div className={"h-screen w-screen text-white"}>
      <div
        className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll sm:w-96"
        id={"scrolls"}
      >
        <div
          className={
            "min-h-screen overflow-x-hidden overflow-y-scroll bg-purple-700/50"
          }
          id="scrolls"
        >
          <div className={"mt-20 rounded-lg border border-white/70 p-2 pb-12"}>
            {postCard}
            {commentCards}
          </div>
          {reply?<NewReply />:<></>}
          <div className={"text-center"}>
            {end ? (
              <>
                <span className={""}>
                  The end
                  <br />
                </span>
                <div
                  className={"cursor-pointer select-none underline"}
                  onClick={() => commentOnPost()}
                >
                  How about replying to this post!
                </div>
              </>
            ) : (
              <VscLoading className={"animate-roll w-10 h-10 mx-auto"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
