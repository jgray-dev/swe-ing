export default function PostPage({
  params: { id: postId },
}: {
  params: { id: string };
}) {
  return <div>This is a post page for post id {postId}</div>;
}