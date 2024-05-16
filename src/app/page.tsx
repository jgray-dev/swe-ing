import Image from "next/image";
import Link from "next/link";
import { getPosts } from "~/server/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="h-screen w-screen bg-black/60 text-white">
      <div className="flex flex-wrap gap-4">
        {posts.map((post, index) => {
          console.log(post);
          return (
            <div key={index}>
              <Link href={`/post/${post.id}`}>{post.content}</Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
