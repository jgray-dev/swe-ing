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
  post_tags: string[] | null;
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
      if (scrollTop + clientHeight >= scrollHeight - 450 && !loading) {
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
             className={"bg-black/80 p-2 w-full min-h-fit border border-black text-zinc-200 rounded-lg m-2 duration-300 "}>
          <div className={"flex flex-col"}>
            <div className={"w-full h-full min-h-48 flex flex-row"}>
              <div className={"flex flex-col"}>
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Link href={`/user/${post.author_id}`}>
                    <Image
                      src={post.author_url}
                      fill
                      className="object-cover"
                      alt=""
                      sizes="40px"
                    />
                  </Link>
                </div>
                <div className={"bg-green-400/10"}>
                  {post.post_tags?post.post_tags.map((tag)=>(<span key={tag} className={"bg-red-400 m-2 text-sm text-zinc-400"}>{tag}</span>)):null}
                </div>
              </div>
              <Link key={post.created_at + post.id + Math.random()} href={`/post/${post.id}`}>
                <div className={"flex flex-col"}>
                  <div className={"h-full border-l border-white/50 ml-2 pl-2 text-left"}>{post.content}</div>
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
        className="sm:w-96 w-screen pt-20 fixed top-0 left-1/2 -translate-x-1/2 h-screen overflow-y-scroll no-scrollbar"
        id={"scrolls"}>
        <div className={"overflow-y-scroll"}>
          {cards}
        </div>
      </div>
    </div>
  );
}