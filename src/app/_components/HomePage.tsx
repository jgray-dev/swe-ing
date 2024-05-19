"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { nextPostPage } from "~/server/api/queries";
import Link from "next/link";
import type {Post} from "~/app/_components/interfaces"

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Array<Post>>([]);
  const [cards, setCards] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    void fetchData();
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
      }
    };
    const div = document.getElementById("scrolls");
    div?.addEventListener("scroll", handleScroll);
    return () => {
      div?.removeEventListener("scroll", handleScroll);
    };
  }, [loading, allPosts, page]);

  async function fetchData() {
    if (!loading) {
      const data = await nextPostPage(page);
      if (data.length > 0) {
        setAllPosts((prevPosts) => [...prevPosts, ...data]);
        setCards((prevCards) => [...prevCards, ...getCards(data)]);
        setPage((prevPage) => prevPage + 1);
        setLoading(false);
      } else {
        console.warn("End of posts");
      }
    } else {
      console.warn("User scrolled, but we're already fetching more data");
    }
  }

  function getCards(data: Post[]): React.ReactElement[] {
    return data.map((post) => {
      return (
        <div
          key={post.created_at + post.id + Math.random()}
          className={
            "backdrop-blur-xs my-2 min-h-fit w-full rounded-lg border border-white/50 bg-black/90 p-2 text-zinc-200 duration-300"
          }
        >
          <div className={"flex flex-col"}>
            <div className={"flex h-full min-h-36 w-full flex-row"}>
              <div className={"flex flex-col"}>
                <div
                  className={
                    "flex w-20 min-w-20 max-w-20 flex-col items-center border-r border-white/50 pr-2 text-sm"
                  }
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Link href={`/user/${post.author_id}`}>
                      <Image
                        src={post.author_url}
                        fill
                        loading={"lazy"}
                        className="object-cover"
                        alt=""
                        sizes="40px"
                      />
                    </Link>
                  </div>
                  {post.author_name}
                </div>
                <div
                  className={
                    "mr-1 h-fit min-h-0 w-20 min-w-20 max-w-20 border-r border-t border-white/50"
                  }
                >
                  <div className={"flex flex-wrap"}>
                    {post.post_tags
                      ? post.post_tags.split(",").map((tag) => {
                          if (tag !== "") {
                            return (
                              <Link key={Math.random()} href={`/search/${tag}`}>
                                <div
                                  key={Math.random()}
                                  className="m-0.5 ml-0 w-fit max-w-20 overflow-x-hidden truncate rounded-sm bg-white/5 p-0.5 text-left text-xs text-zinc-500"
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
                <div className={"flex flex-col"}>
                  <div
                    className={
                      "h-full max-h-48 truncate whitespace-break-spaces text-wrap pl-2 text-left"
                    }
                  >
                    {post.content}
                  </div>
                </div>
              </Link>
            </div>
            <div className={"mt-2 border-t border-white/50"}>
              Like repost share buttons here
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
