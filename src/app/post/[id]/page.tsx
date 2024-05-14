import { getPost } from "~/server/queries";

export default async function PostPage({
  params: { id: postId },
}: {
  params: { id: string };
}) {
  const post = await getPost(Number(postId));
  console.log(post);
  return <div>This is a post page for post id {postId}</div>;
}
