import Link from "next/link";
import { api } from "~/trpc/server";

export default async function Home() {
  const allPosts = api.posts.getHomePage({page: 1})
  console.log(allPosts)
  return (
    <main className="h-screen w-screen pt-16 text-white">
      home page gaga
    </main>
  );
}



