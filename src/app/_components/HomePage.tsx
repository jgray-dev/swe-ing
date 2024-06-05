"use client";

import React, { useEffect, useState } from "react";
import { getHomePageOrder } from "~/server/api/queries";
import {useAlertState, useUserState} from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";
import PostsPage from "~/app/_components/PostsPage";

export default function HomePage() {
  const [hpo, setHpo] = useState<number[]>();
  const { user_id } = useUserState((state) => state);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const setAlert = useAlertState((state) => state.setAlert);
  

  useEffect(() => {
    // console.log("useEffect called");
    void firstLoad();
    //eslint-disable-next-line
  }, [user_id]);

  async function firstLoad() {
    // console.log("Firstload called");
    if (user_id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({text: "Getting post order", type: "loading"});
      const hpo = await getHomePageOrder(user_id);
      setHpo(hpo);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({text: "Waiting for user state", type: "info"});
    }
  }

  if (hpo) {
    // console.log("We have HPO");
    return (
      <div className={""}>
        <PostsPage order={hpo} />
      </div>
    );
  } else {
    // console.log("Waiting for HPO");
    return (
      <div className={"w-screen text-center text-zinc-600"}>
        <VscLoading className={"animate-roll mx-auto h-8 w-8 text-white"} />
        <span>user_id {user_id}</span>
      </div>
    );
  }
}
