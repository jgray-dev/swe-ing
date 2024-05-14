import { db } from "~/server/db";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await db.query.posts.findMany();

  return (
    <main className="h-screen w-screen bg-zinc-900 text-white">
      <div className="flex flex-wrap gap-4">
        {posts.map((post, index) => {
          return (
            <div key={index}>
              <Link href={`/post/${post.id}`}>
                <h1>meow</h1>
                <Image
                  src={post.imageUrl}
                  alt={post.authorId}
                  width={200}
                  height={200}
                  style={{ width: "auto" }}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
