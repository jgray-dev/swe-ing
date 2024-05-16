import { getPost } from "~/server/queries";
import Link from "next/link";

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = params.id;
  const post = await getPost(Number(postId));
  console.log(post);
  if (post) {
    return (
      <div className={"h-full w-full bg-white/10"}>
        <div>{post.content}</div>
        This is a post page for post id {postId}
      </div>
    );
  } else {
    return (
      <div
        className={
          "fixed left-0 top-0 z-50 h-screen w-screen bg-black text-center text-2xl text-red-400"
        }
      >
        <div>Post not found</div>
        <div className="mt-4 text-lg text-white underline">
          <Link href="/">Go back home</Link>
        </div>
      </div>
    );
  }
}
