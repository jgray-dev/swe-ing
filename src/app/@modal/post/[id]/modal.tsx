export default function modalPostPage({
  params: { id: postId },
}: {
  params: { id: string };
}) {
  return (
    <div>This is a modal post page for post id {postId} BUT IN MODAL.TSX</div>
  );
}
