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
    void firstLoad();
    //eslint-disable-next-line
  }, [user_id]);

  async function firstLoad() {
    if (user_id) {
      const hpo = await getHomePageOrder(user_id);
      setHpo(hpo);
    } else {
      console.info("Waiting for user state");
    }
  }

  if (hpo) {
    return <PostsPage order={hpo} />;
  } else {
    return <VscLoading className={"animate-roll mx-auto h-8 w-8"} />;
  }
}
