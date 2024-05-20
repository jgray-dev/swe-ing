"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { nextPostPage } from "~/server/api/queries";
import Link from "next/link";
import type { post } from "~/app/_components/interfaces";
import { useUser } from "@clerk/shared/react";
import { CiHeart, CiShare1 } from "react-icons/ci";
import { GoCommentDiscussion } from "react-icons/go";
import { PiDotsNine } from "react-icons/pi";
import PostContextMenu from "~/app/_components/PostContextMenu";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Array<post>>([]);
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState(<></>);

  const { isSignedIn, user } = useUser();
  useEffect(() => {
    if (isSignedIn) {
      setUserId(user.id);
    }
    //eslint-disable-next-line
  }, [isSignedIn]);

  useEffect(() => {
    void fetchData();
    setLoading(true);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const div = document.getElementById("scrolls");
      const scrollTop = div ? div.scrollTop : 0;
      const scrollHeight = div ? div.scrollHeight : 0;
      const clientHeight = div ? div.clientHeight : 0;
      if (scrollTop + clientHeight >= scrollHeight - 250 && !loading) {
        setLoading(true);
        void fetchData();
        setPage((prevPage) => prevPage + 1);
      }
    };
    const div = document.getElementById("scrolls");
    div?.addEventListener("scroll", handleScroll);
    return () => {
      div?.removeEventListener("scroll", handleScroll);
    };
    //eslint-disable-next-line
  }, [loading]);

  async function fetchData() {
    if (!loading) {
      const data = await nextPostPage(page);
      if (!data) {
        console.warn("No data returned from server");
        return;
      }
      if (data.length > 0) {
        const newPosts = data.filter(
          (newPost) => !allPosts.some((post) => post.id === newPost.id),
        );
        if (newPosts.length > 0) {
          console.log("new posts", newPosts);
          setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setCards([...cards, ...getCards(newPosts)]);
        }
        setLoading(false);
      } else {
        console.warn("End of posts");
      }
    } else {
      console.warn("User scrolled, but we're already fetching more data");
    }
  }

  function likePost(id: number) {
    console.log("like post ", id);
  }
  function showContextMenu(id: number) {
    setContextMenu(<PostContextMenu />);
    console.log("context menu for post ", id);
  }
  async function sharePost(id: number, title: string) {
    console.log("share post ", id);
    await navigator.share({
      url: `https://swe.ing/post/${id}`,
      title: `${title}`,
    });
  }

  function getCards(data: post[]): React.ReactElement[] {
    return data.map((post) => {
      return (
        <div
          key={post.created_at + post.id + Math.random()}
          className={
            "backdrop-blur-xs my-2 min-h-fit w-[99%] translate-x-[0.5%] rounded-lg border border-white/50 bg-black/90 p-1.5 text-zinc-200 duration-300"
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
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
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
                  className={
                    "line-clamp-[10] h-fit max-h-72 min-h-36 min-w-full max-w-full text-wrap pl-2 text-left"
                  }
                >
                  {post.content}
                </div>
              </Link>
            </div>
            <div className={"mt-2 border-t border-white/50"}>
              <div className={"flex flex-row justify-between px-4 pt-1.5"}>
                <div
                  className={"group flex flex-row text-zinc-400"}
                  onClick={() => likePost(post.id)}
                >
                  <CiHeart
                    className={
                      "mr-1.5 h-6 w-6 duration-150 group-hover:text-white"
                    }
                  />
                  <span
                    className={
                      "invisible absolute inline-flex h-6 w-6 rounded-full bg-red-400/30 group-hover:visible group-hover:animate-ping"
                    }
                  ></span>
                  <span className={"duration-150 group-hover:text-white"}>
                    {post.likes ? post.likes.length : 0}
                  </span>
                </div>

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
                  <PiDotsNine
                    className={
                      "h-6 w-6 text-zinc-400 duration-150 hover:text-white motion-safe:hover:scale-110"
                    }
                    onClick={() => showContextMenu(post.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div>
      <div
        className="no-scrollbar fixed left-1/2 top-0 h-screen w-screen -translate-x-1/2 overflow-y-scroll pt-20 sm:w-96"
        id={"scrolls"}
      >
        <div className={"overflow-y-scroll"}>
          {cards}
          <div className={"pb-12 pt-24"}>
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
