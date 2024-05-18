"use client";

import Image from 'next/image'
import React, { useEffect, useState } from "react";
import {nextPostPage} from "~/server/api/queries";
import Link from "next/link";

interface Post {
  id: number;
  author_id: string;
  author_name: string;
  author_url: string;
  content: string;
  image_urls: string[] | null;
  post_tags: string;
  created_at: number;
  updated_at: number;
}

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
        <div key={post.created_at + post.id + Math.random()}
             className={"bg-black/90 backdrop-blur-xs p-2 w-full min-h-fit border border-white/50 text-zinc-200 rounded-lg my-2 duration-300"}>
          <div className={"flex flex-col"}>
            <div className={"w-full h-full min-h-36 flex flex-row"}>
              <div className={"flex flex-col"}>
                <div className={"w-20 max-w-20 min-w-20 text-sm border-r border-white/50 flex flex-col items-center pr-2"}>
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
                <div className={"w-20 max-w-20 min-w-20 mr-1 border-t border-r border-white/50 h-fit min-h-0"}>
                  <div className={"flex flex-wrap"}>
                    {post.post_tags ? post.post_tags.split(",").map((tag) => {
                          if (tag !== "") {
                            return (
                              <Link key={Math.random()} href={`/search/${tag}`}>
                                <div
                                  key={Math.random()}
                                  className="text-xs text-zinc-500 m-0.5 ml-0 text-left bg-white/5 rounded-sm w-fit max-w-20 truncate overflow-x-hidden p-0.5"
                                  title={tag}
                                >
                                  {tag}
                                </div>
                              </Link>)
                          } else {
                            return null
                          }
                        }
                      )
                     : null}
                  </div>
                </div>
              </div>
              <Link key={post.created_at + post.id + Math.random()} href={`/post/${post.id}`}>
                <div className={"flex flex-col"}>
                  <div className={"h-full pl-2 text-left truncate max-h-48 text-wrap whitespace-break-spaces"}>{post.content}</div>
                </div>
              </Link>
            </div>
            <div className={"border-t border-white/50 mt-2"}>Like repost share buttons here</div>
          </div>
        </div>
      )
    });
  }

  return (
    <div>
    <div
        className="sm:w-96 no-scrollbar w-screen pt-20 fixed top-0 left-1/2 -translate-x-1/2 h-screen overflow-y-scroll"
        id={"scrolls"}>
        <div className={"overflow-y-scroll"}>
          {cards}
          <div className={"pt-24 pb-12"}>
            The end. <br/><Link href={"/newpost"} className={"underline"}> How about creating a new post</Link>
          </div>

        </div>
      </div>
    </div>
  );
}