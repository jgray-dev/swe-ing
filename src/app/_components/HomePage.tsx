"use client";

import React, { useEffect, useState } from "react";
import { getHomePageOrder } from "~/server/api/queries";
import { useUserState } from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";
import PostsPage from "~/app/_components/PostsPage";

export default function HomePage() {
  const [hpo, setHpo] = useState<number[]>();
  const { user_id } = useUserState((state) => state);

  useEffect(() => {
    console.log("useEffect called")
    void firstLoad();
    //eslint-disable-next-line
  }, [user_id]);

  async function firstLoad() {
    console.log("Firstload called")
    if (user_id) {
      const hpo = await getHomePageOrder(user_id);
      setHpo(hpo);
    } else {
      console.info("Waiting for user state");
    }
  }

  if (hpo) {
    console.log("We have HPO")
    return (
      <div className={"h-screen w-screen pt-20"}>
        <PostsPage order={hpo} />
      </div>
    );
  } else {
    console.log("Waiting for HPO")
    return (
      <div className={"w-screen text-center text-zinc-600"}>
        <VscLoading className={"animate-roll mx-auto h-8 w-8 text-white"} />
        <span>user_id {user_id}</span>
      </div>
    );
  }
}
