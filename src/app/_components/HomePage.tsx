"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getDbUser, nextHomePage } from "~/server/api/queries";
import Link from "next/link";
import type { like, post } from "~/app/_components/interfaces";
import { useUser } from "@clerk/shared/react";
import { CiShare1 } from "react-icons/ci";
import { GoCommentDiscussion } from "react-icons/go";
import LikeButton from "~/app/_components/LikeButton";
import ContextMenu from "~/app/_components/ContextMenu";
import {useRouter} from "next/navigation";

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Array<post>>([]);
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const { user, isSignedIn } = useUser();

  async function dbUser(clerkId: string) {
    return getDbUser(clerkId);
  }
  useEffect(() => {
    void firstLoad();
    //eslint-disable-next-line
  }, [isSignedIn]);

  async function firstLoad() {
    if (!userId) {
      if (isSignedIn) {
        await dbUser(user.id).then(async (data) => {
          if (data) {
            setUserId(data.id);
            setLoading(true);
            void (await fetchData(data.id));
          } else {
            //TODO: Alert user of error and refresh page
            router.refresh()
            console.error("Error fetching user from local database");
          }
        });
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 750 && !loading) {
        console.log("Loading more posts");
        void fetchData(userId);
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

  async function fetchData(user_id?: number) {
    setLoading(true);
    console.log("genextHomePage")
    const data = await nextHomePage(page, user_id);
    if (!data) {
      console.warn("No data returned from server");
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
        setCards([...cards, ...getCards(newPosts, user_id)]);
        setLoading(false);
      }
    } else {
      console.warn("End of posts");
      setEnd(true);
    }
    if (!end) {
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

  function getCards(data: post[], user_id?: number): React.ReactElement[] {
    return data.map((post) => getCard(post, user_id));
  }

  function getCard(post: post, user_id?: number): React.ReactElement {
    if (userId) {
      user_id = userId;
    }
    const liked = post.likes?.some((like) => like.user_id === user_id) ?? false;
    const key = (post.created_at + post.id) / Math.random();
    return (
      <div
        id={`${key}`}
        key={key}
        className={
          "backdrop-blur-xs z-10 my-2 min-h-fit w-[99%] translate-x-[0.5%] rounded-lg border border-white/50 bg-black/90 p-1.5 text-zinc-200 duration-300"
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
              <div className={"group flex flex-row text-zinc-400"}>
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

              <div>
                <CiShare1
                  className={
                    "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:-translate-y-0.5 motion-safe:hover:translate-x-0.5"
                  }
                  onClick={() => sharePost(post.id, post.content)}
                />
              </div>

              <div>
                <ContextMenu post={post} user_id={user_id} id={`${key}`} />
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
          <div className={"pb-20 pt-24"}>
            {!end && (loading || cards.length == 0) ? "Loading more post" : ""}
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
