import Image from "next/image";
import Link from "next/link";
import { getPosts } from "~/server/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="h-screen w-screen bg-zinc-900 text-white">
      <div className="flex flex-wrap gap-4">
        {posts.map((post, index) => {
          return (
            <div key={index}>
              <Link href={`/post/${post.id}`}>
                <h1>meow</h1>
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.authorId}
                    width={200}
                    height={200}
                    style={{ width: "auto" }}
                  />
                ) : null}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
