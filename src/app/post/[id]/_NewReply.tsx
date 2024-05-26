import {useUserState} from "~/app/_functions/store";

export default function NewReply(post_id: number) {
  const {user_id} = useUserState(state => state)
  console.log(user_id, post_id)
  console.log("commenting")
  return (
    <div className={"h-screen w-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xs text-white"}>
    <div className={"mxx-auto sm:w-96 w-screen h-screen py-24"}>
      <div className={"bg-green-400/20"}>
        New reply to post {post_id} from user {user_id}
      </div>
    </div>
  </div>)
}