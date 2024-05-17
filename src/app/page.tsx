import Link from "next/link";
import { getPosts } from "~/server/queries";
import {getNameFromId} from "~/app/_functions/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts(1);
  return (
    <main className="h-screen w-screen bg-black/80 text-white">
      <div className="flex w-screen items-center justify-center">
        <div id="page" className={"md:px-4"}>
          {posts.map(async (post) => {
            return (
              <Link href={`/post/${post.id}`}>
                <div
                  key={post.id}
                  className={
                    "my-2 h-fit rounded-md border mx-4 md:mx-0 border-white bg-black/70 py-4 backdrop-blur-sm md:w-96"
                  }
                >
                  {post.content}
                  {post.author_name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
