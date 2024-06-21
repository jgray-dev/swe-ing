"use client";

import React, { useEffect, useState } from "react";
import { nextCommentsPage, singlePost } from "~/server/api/queries";
import type { comment, post } from "~/app/_functions/interfaces";
import { CommentCard } from "~/app/post/[id]/_CommentCard";
import { VscLoading } from "react-icons/vsc";
import NewReply from "~/app/post/[id]/_NewReply";
import { useReplyState, useUserState } from "~/app/_functions/store";
import Link from "next/link";
import Image from "next/image";
import { getTime } from "~/app/_functions/functions";
import LikeButton from "~/app/_components/LikeButton";
import { GoCommentDiscussion } from "react-icons/go";
import { CiShare1 } from "react-icons/ci";
import ContextMenu from "~/app/_components/ContextMenu";

export default function PostPage({ params }: { params: { id: string } }) {
  const [postId, setPostId] = useState<number>(Number(params.id));
  const { user_id } = useUserState((state) => state);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(true);
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState(false);
  const [realPost, setRealPost] = useState(false);
  const [commentCards, setCommentCards] = useState<React.ReactElement[]>([]);
  const [postCard, setPostCard] = useState<React.ReactElement>(
    <div className={"w-screen text-center text-zinc-600"}>
      <VscLoading className={"animate-roll mx-auto h-8 w-8 text-green-200"} />
      <span>user_id {user_id}</span>
    </div>,
  );
  const { setReplyData } = useReplyState((state) => state);

  function commentOnPost() {
    setReplyData({ post_id: Number(postId) });
    setReply(true);
  }

  async function getData() {
    const postCard = await getPostCard();
    setPostCard(postCard);
  }

  useEffect(() => {
    void getData();
    setPostId(Number(params.id));
    //eslint-disable-next-line
  }, [user_id]);

  useEffect(() => {
    // console.log("useEffect getComment");
    void getComments();
    //eslint-disable-next-line
  }, [page]);

  async function getComments(user_id?: number) {
    const newData = await nextCommentsPage(page, postId);
    if (newData.length == 0) {
      setEnd(true);
      setLoading(true);
      console.warn("End of comments");
    } else {
      setLoading(false);
      // @ts-expect-error fts
      const newCards = getCommentCards(newData.reverse(), user_id);
      setCommentCards(newCards);
      // console.log("Newdata fetched", newData);
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
      return (
        <div key={comment.created_at / Math.random()}>
          <CommentCard comment={comment} />
        </div>
      );
    });
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

  async function getPostCard() {
    const post = (await singlePost(postId)) as post;
    if (post) {
      setRealPost(true);
      const liked =
        post.likes?.some((like) => like.user_id === user_id) ?? false;
      const key = (post.created_at + post.id) / Math.random();
      return post.author ? (
        <div
          id={`${key}`}
          key={key}
          className={
            "z-10 my-2 min-h-fit w-[99%] translate-x-[0.5%] border-b-2 border-white/70 p-1.5 text-zinc-200 duration-300"
          }
        >
          <div className={"flex flex-col"}>
            <div className={"flex h-full min-h-36 w-full flex-row"}>
              <div className={"flex flex-col"}>
                <div
                  className={
                    "flex w-20 min-w-20 max-w-20 flex-col items-center border-r border-white/50 pr-2 text-center text-xs"
                  }
                >
                  <div className="relative h-12 w-12 select-none overflow-hidden rounded-full">
                    <Link href={`/user/${post.author_id}`}>
                      <Image
                        src={post.author.image_url}
                        fill
                        loading={"lazy"}
                        className="object-cover"
                        alt=""
                        sizes="40px"
                      />
                    </Link>
                  </div>
                  <div
                    className={`${
                      post.author.permission === 1
                        ? "text-emerald-300"
                        : post.author.permission === 2
                          ? "text-orange-400"
                          : post.author.permission === 3
                            ? "text-red-500"
                            : "text-zinc-200"
                    }`}
                  >
                    <span
                      title={`${post.author.permission == 1 ? "VIP" : post.author.permission == 2 ? "Moderator" : post.author.permission == 3 ? "Owner" : ""}`}
                    >
                      {post.author.name}
                    </span>
                  </div>
                  <br />
                  <span className={"text-xs text-zinc-600"}>
                    {getTime(post.created_at)} ago
                  </span>
                </div>
                <div
                  className={
                    "mr-1 h-fit min-h-0 w-20 min-w-20 max-w-20 border-r border-t border-white/50"
                  }
                >
                  <div className={"flex max-h-24 flex-wrap overflow-hidden"}>
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
                  "h-fit max-h-fit min-h-36 min-w-[80%] max-w-[80%] text-wrap break-normal pl-2 text-left"
                }
              >
                <div
                  id={`${key + "CONTENT"}`}
                  className="overflow-x-hidden whitespace-pre-wrap break-keep"
                >
                  {post.content}
                </div>
                <div className={"flex w-[80%] flex-wrap pt-20"}>
                  {post.image_urls ? (
                    post.image_urls.split(",").map((url) => {
                      return (
                        <div key={url} id={url}>
                          <Link
                            href={`https://utfs.io/f/${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className={"group m-1 w-full cursor-pointer"}>
                              <Image
                                src={`https://utfs.io/f/${url}`}
                                width={256}
                                height={256}
                                className="object-cover"
                                alt=""
                                sizes="256px"
                              />
                              <div
                                className={
                                  "w-full text-center text-xs text-zinc-600 duration-200 group-hover:text-zinc-400"
                                }
                              >
                                Click to view full image
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </div>
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
                <div
                  className={"group flex cursor-pointer flex-row text-zinc-400"}
                  onMouseDown={() => commentOnPost()}
                >
                  <GoCommentDiscussion
                    className={
                      "mr-1.5 h-6 w-6 duration-150 group-hover:text-white motion-safe:group-hover:-translate-y-[5%] motion-safe:group-hover:rotate-3"
                    }
                  />
                  <span className={"duration-150 group-hover:text-white"}>
                    {post.comments ? post.comments.length : 0}
                  </span>
                </div>

                <div className={"cursor-pointer"}>
                  <CiShare1
                    className={
                      "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:-translate-y-0.5 motion-safe:hover:translate-x-0.5"
                    }
                    onMouseDown={() => sharePost(post.id, post.content)}
                  />
                </div>

                <div className={"cursor-pointer"}>
                  <ContextMenu post={post} id={`${key}`} postPage={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      );
    } else {
      setRealPost(false);
      return (
        <div className={"w-full text-center text-xl text-red-600"}>
          Post not found
        </div>
      );
    }
  }

  return (
    <div className={"h-screen w-screen text-white"}>
      {reply ? (
        <div className={"h-screen w-screen overflow-y-hidden"}>
          <NewReply closeReply={setReply} />{" "}
        </div>
      ) : (
        <></>
      )}
      <div
        className={`no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll ${reply ? "overflow-y-hidden" : "overflow-y-scrolls"} sm:w-96`}
        id={"scrolls"}
      >
        <div
          className={"min-h-screen overflow-x-hidden overflow-y-scroll"}
          id="scrolls"
        >
          <div
            className={
              "mb-12 mr-0.5 mt-20 rounded-lg border border-white/70 bg-black/80 p-2 backdrop-blur-sm"
            }
          >
            {postCard}
            {commentCards}
            <div className={"text-center"}>
              {end ? (
                realPost ? (
                  <>
                    <span className={""}>
                      The end
                      <br />
                    </span>
                    <div
                      className={"cursor-pointer select-none underline"}
                      onMouseDown={() => commentOnPost()}
                    >
                      How about replying to this post!
                    </div>
                  </>
                ) : (
                  <div className={"w-full text-base text-white underline"}>
                    <Link href={"/"}>Go home</Link>
                  </div>
                )
              ) : (
                <VscLoading className={"animate-roll mx-auto h-10 w-10"} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
