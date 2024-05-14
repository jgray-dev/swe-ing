import { Modal } from "./modal";

export default function PostPage({
  params: { id: postId },
}: {
  params: { id: string };
}) {
  return <Modal>This is a modal post page for post id {postId}</Modal>;
}
