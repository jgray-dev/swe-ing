"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

export default function PostPage({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  const post = api.posts.getSingle.useQuery({ id: postId });
  if (!post.isLoading) {
    if (post.data) {
      console.log(post.data);
      const time = new Date(post.data?.created_at).toLocaleString();
      return (
        <div className={"h-screen w-screen pt-16 text-white"}>
          This is a post page for post id {postId}
          <div className={"pt-12"}>Time: {time}</div>
          <div>Author: {post.data?.author_id}</div>
          <div>Content:{post.data?.content}</div>
          {}
        </div>
      );
    } else {
      return (
        <div
          className={
            "left-0 top-0 z-50 h-screen w-screen bg-black text-center text-2xl text-red-400"
          }
        >
          <div>Post not found</div>
          <div className="mt-4 text-lg text-white underline">
            <Link href="/">Go back home</Link>
          </div>
        </div>
      );
    }
  } else {
    return (
      <div
        className={
          "text-md left-0 top-0 z-50 h-screen w-screen bg-black text-center text-white"
        }
      >
        <div>Loading</div>
        <div className="mt-4 text-lg text-white underline"></div>
      </div>
    );
  }
}
