"use client";

import React, { useEffect, useState } from "react";
import { getSearchPageOrder } from "~/server/api/queries";
import { useUserState } from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";
import PostsPage from "~/app/_components/PostsPage";

export default function SearchPage({ params }: { params: { query: string } }) {
  const [po, setPo] = useState<number[]>();
  const { user_id } = useUserState((state) => state);

  useEffect(() => {
    void firstLoad();
    //eslint-disable-next-line
  }, [user_id]);

  async function firstLoad() {
    if (user_id) {
      const po = await getSearchPageOrder(params.query);
      setPo(po);
    }
  }

  if (po) {
    return (
      <div className={"h-screen w-screen text-white"}>
        <PostsPage order={po} />
      </div>
    );
  } else {
    return (
      <div className={"h-screen w-screen pt-20 text-center text-zinc-600"}>
        <VscLoading className={"animate-roll mx-auto h-8 w-8 text-white"} />
        <span>user_id {user_id}</span>
      </div>
    );
  }
}
