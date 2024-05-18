"use client";

import React, { useEffect, useState } from "react";
import { nextPostPage } from "~/server/api/queries";
import Link from "next/link";

interface Post {
  id: number;
  author_id: string;
  author_name: string;
  content: string;
  image_urls: string[] | null;
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
    return data.map((post) => (
      <Link key={post.created_at + post.id + Math.random()} href={`/post/${post.id}`}> 
      <div key={post.created_at + post.id + Math.random()} className={"bg-black/90 w-full min-h-fit border border-black text-white rounded-lg m-2"}>
        <div className={"w-full h-full bg-red-400 min-h-48"}>
        </div>
      </div>
      </Link>
    ));
  }

  return (
    <div>
      <div className="sm:w-96 w-screen pt-20 fixed top-0 left-1/2 -translate-x-1/2 h-screen overflow-y-scroll no-scrollbar" id={"scrolls"}>
        <div className={"overflow-y-scroll"}>
          {cards}
        </div>
      </div>
    </div>
  );
}