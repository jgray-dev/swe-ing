"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { nextHomePage } from "~/server/api/queries";
import Link from "next/link";
import type { like, post } from "~/app/_functions/interfaces";
import { CiShare1 } from "react-icons/ci";
import { GoCommentDiscussion } from "react-icons/go";
import LikeButton from "~/app/_components/LikeButton";
import ContextMenu from "~/app/_components/ContextMenu";
import { getTime } from "~/app/_functions/functions";
import { useAlertState, useUserState } from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";

interface PostsPageProps {
  order: number[];
}

export default function PostsPage({ order }: PostsPageProps) {
  const { user_id } = useUserState((state) => state);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Array<post>>([]);
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const setAlert = useAlertState((state) => state.setAlert);

  useEffect(() => {
    void firstLoad();
    //eslint-disable-next-line
  }, [user_id]);

  async function firstLoad() {
    if (user_id) {
      void (await fetchData(order));
    } else {
      console.info("Waiting for user state");
    }
  }

  let localLoading = false;
  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (
        scrollTop + clientHeight >= scrollHeight - 1250 &&
        !loading &&
        !localLoading
      ) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        localLoading = true;
        void fetchData(order);
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

  async function fetchData(postOrder: number[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setAlert({ text: "Fetching more posts", type: "loading" });
    setLoading(true);
    const data = await nextHomePage(page, user_id, postOrder);
    if (!data) {
      console.warn("No data returned from server");
      setEnd(true);
      setLoading(false);
      return;
    }
    if (data.length > 0) {
      const newPosts = data.filter(
        (newPost) => !allPosts.some((post) => post.id === newPost.id),
      );
      if (newPosts.length > 0) {
        const newLikedPosts = [...likedPosts];
        newPosts.forEach((post: post) => {
          if (post.likes) {
            post.likes.forEach((like: like) => {
              if (like.user_id === user_id) {
                newLikedPosts.push(post.id);
              }
            });
          }
        });
        setLikedPosts(newLikedPosts);
        setAllPosts([...allPosts, ...newPosts]);
        setCards([...cards, ...getCards(newPosts)]);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setAlert({ text: "", type: "info" });
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "", type: "info" });
      setEnd(true);
    }
    if (!end) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "", type: "info" });
      setLoading(false);
    }
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

  function getCards(data: post[]): React.ReactElement[] {
    return data.map((post) => getCard(post));
  }

  function getCard(post: post): React.ReactElement {
    const liked = post.likes?.some((like) => like.user_id === user_id) ?? false;
    const key = (post.created_at + post.id) / Math.random();
    return (
      <div
        id={`${key}`}
        key={key}
        className={
          "backdrop-blur-xs z-10 my-2 min-h-fit w-[99%] translate-x-[0.5%] rounded-lg border border-white/50 bg-black/80 p-1.5 text-zinc-200 duration-300"
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
                <br />
                <span className={"text-center text-xs text-zinc-600"}>
                  {getTime(post.updated_at)} ago
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
            <Link
              key={post.created_at + post.id + Math.random()}
              href={`/post/${post.id}`}
              className={"max-w-full pr-14 min-w-full"}
            >
              <div
                className={
                  "line-clamp-[10] h-fit max-h-72 min-h-36 min-w-full max-w-full pl-1 text-left"
                }
              >
                <div id={`${key + "CONTENT"}`} className="whitespace-pre-wrap break-keep w-[90%] overflow-x-hidden">
                  {post.content}
                </div>
                <div className={"flex w-[80%] flex-row justify-between"}>
                  {post.image_urls ? (
                    post.image_urls.split(",").map((url) => {
                      return (
                        <div
                          key={url}
                          className={"m-1 max-w-[40%] cursor-pointer"}
                        >
                          <Image
                            src={`https://utfs.io/f/${url}`}
                            width={128}
                            height={128}
                            className="object-cover"
                            alt=""
                            sizes="128px"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
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
              <div
                className={"group flex cursor-pointer flex-row text-zinc-400"}
              >
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
                  onMouseDown={() => sharePost(post.id, post.content)}
                />
              </div>

              <div className={"cursor-pointer"}>
                <ContextMenu post={post} id={`${key}`} postPage={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll pt-20 sm:w-96"
        id={"scrolls"}
      >
        <div className={"overflow-x-hidden overflow-y-scroll"}>
          {cards}
          <div className={"pb-20 pt-24 text-center text-white"}>
            {!end && (loading || cards.length == 0) ? (
              <VscLoading
                className={"animate-roll mx-auto h-10 w-10 text-emerald-700"}
              />
            ) : (
              ""
            )}
            <br />
            <br />
            <br />
            The end. <br />
            <Link href={"/newpost"} className={"underline"}>
              {" "}
              How about creating a new post
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
