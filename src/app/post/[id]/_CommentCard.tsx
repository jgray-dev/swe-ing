import type {comment} from "~/app/_functions/interfaces";
import React from "react";
import {useUserState} from "~/app/_functions/store";

interface CommentCardProps {
  comment: comment;
}
export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const {user_id, name, clerk_id} = useUserState(state => state)
  console.log("USER STATE ZUSTAND")
  console.log(user_id, name, clerk_id)
  return (<div key={comment.created_at / Math.random()}>
    comment card here
  </div>)
}