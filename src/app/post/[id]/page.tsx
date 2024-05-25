"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/shared/react";
import { getDbUser, singlePost } from "~/server/api/queries";
import { PostCard } from "~/app/post/[id]/_PostCard";
import type {comment, post, user } from "~/app/_functions/interfaces";

export default function PostPage({ params }: { params: { id: string } }) {
  const [postId, setPostId] = useState<number>(Number(params.id));
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useUser();
  const [commentCards, setCommentCards] = useState<React.ReactElement[]>([]);
  const [postCard, setPostCard] = useState<React.ReactElement>(<></>);

  function commentOnPost() {
    console.log("user wants to comment :P");
  }

  async function getPost(userid: number) {
    const pagePost = await singlePost(postId);
    console.log(pagePost)
    if (user?.id)
      setPostCard(<PostCard post={pagePost as post} user_id={userid} />);
  }

  async function getUser() {
    if (user?.id) {
      const dbUser = await getDbUser(user.id);
      void getPost(Number(dbUser?.id));
    }
  }

  useEffect(() => {
    void getUser();
    setPostId(Number(params.id));
  }, [user]);

  useEffect(() => {
    console.log("useEffect getComment")
    // void getComments()
  }, [page]);

  // async function getComments() {
  //   const newData = await nextPostPage(page, postId);
  //   if (newData.length == 0) {
  //     setEnd(true)
  //     setLoading(true)
  //     console.warn("End of comments");
  //   } else {
  //     setLoading(false)
  //     // @ts-expect-error fts
  //     const newCards = getCommentCards(newData)
  //     setCommentCards(newCards)
  //     console.log("Newdata fetched", newData);
  //   }
  // }
  //Comments infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 1250 && !loading) {
        setLoading(true)
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
    return comments.map((comment)=>{
      const key = (comment.created_at) / Math.random();
      console.log(comment)
      return (
        <div key={key}>
          <div className={" flex flex-col"}>
            <div className={'bg-orange-400/20'}>
              dsa
            </div>
            <div className={"bg-purple-400/20"}>
              asd
            </div>
          </div>
        </div>
      )
    })
  }
  
  
  return (
    <div className={"h-screen w-screen text-white"}>
      <div
        className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll pt-20 sm:w-96"
        id={"scrolls"}
      >
        <div className={"overflow-x-hidden overflow-y-scroll bg-purple-700/50 min-h-screen"} id="scrolls">
          <div className={"mt-24 rounded-lg border border-white/70 p-2 pb-12"}>
            {postCard}
            {commentCards}
          </div>
          <div className={"text-center"}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
