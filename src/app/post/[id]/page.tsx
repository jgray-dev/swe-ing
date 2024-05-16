import { getPost } from "~/server/queries";

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
  }
}
