"use client";
import React, { useEffect, useState } from "react";
import { getDbUserFromId, isUserFollowing } from "~/server/api/queries";
import { useUserState } from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";
import Link from "next/link";
import Image from "next/image";

export default function UserPage({ params }: { params: { id: string } }) {
  const [userId] = useState<number>(Number(params.id));
  const [fullUserCard, setFullUserCard] = useState<React.ReactElement>(
    <VscLoading className={"animate-roll mx-auto h-10 w-10"} />,
  );
  const { user_id } = useUserState((state) => state);

  useEffect(() => {
    if (user_id !== 0) {
      void userCard();
    }
    //eslint-disable-next-line
  }, [user_id]);

  function followUser() {
    console.log("Follow user");
  }

  async function userCard() {
    const following = await isUserFollowing(userId, user_id);
    console.log(!!following);
    const fullUser = await getDbUserFromId(userId);
    console.log("Full user:");
    console.log(fullUser);
    
    fullUser?setFullUserCard(
      <div
        className={
          "mx-auto flex w-screen flex-col text-center sm:w-[30rem]"
        }
      >
        <div className={"flex flex-row"}>
          <div className={"border-r border-white/50 pr-2"}>
            <div className="relative h-28 max-h-28 min-h-28 w-28 min-w-28 max-w-28 select-none overflow-hidden rounded-full ">
              <Image
                src={fullUser.image_url}
                fill
                className="object-cover"
                alt=""
                sizes="640px"
                placeholder="empty"
                priority={true}
              />
            </div>
            <button
              className={`mt-4 rounded-full border-2 border-white/50 px-4 py-2 ${!!following ? "bg-red-400" : "bg-white/30"} text-white/80 hover:text-white`}
              onClick={() => followUser()}
            >
              {!!following ? "Unfollow" : "Follow"}
            </button>
          </div>
          <div className={"w-full"}>
            <div className={"mx-auto min-h-28 w-full border-b border-white/50"}>
              <div className={"text-3xl font-semibold"}>{fullUser.name}</div>
              <div className={"text-md px-2 pt-4 text-left"}>
                {fullUser.bio ? fullUser.bio : "No bio"}
              </div>
            </div>
            <div className={"p-2 py-1 text-left"}>
              <div className={"text-white/95"}>
                Location: {fullUser.location ? fullUser.location : "Unknown"}
              </div>
              <div className={"text-white/95"}>
                Website:{" "}
                {fullUser.website ? (
                  <Link href={`${fullUser.website}`}>{fullUser.website}</Link>
                ) : (
                  "Unknown"
                )}
              </div>
              <div className={"flex flex-wrap text-white/95"}>
                Skills:{" "}
                {fullUser.skills
                  ? fullUser.skills.split(",").map((skill) => {
                      if (skill == "" || skill == " ") {
                        return null;
                      }
                      return (
                        <div
                          key={Math.random()}
                          className="mx-0.5 ml-0 mb-0.5 mt-1 w-fit max-w-20 overflow-x-hidden truncate rounded-sm bg-white/5 p-0.5 text-left text-xs text-zinc-200"
                          title={skill}
                        >
                          <span className={"pb-0.5"}>{skill}</span>
                        </div>
                      );
                    })
                  : "Unknown"}
              </div>
            </div>
          </div>
        </div>
      </div>,
    ):setFullUserCard(<div className={"w-full text-center pt-20 text-xl text-red-600"}>USER NOT FOUND <div className={"text-white text-sm underline"}>
      <Link href={"/"}>Go home</Link></div></div>)
  }

  return (
    <div
      className={
        "fixed left-0 top-0 h-screen w-screen overflow-hidden bg-black/10 pt-20 text-white"
      }
    >
      {fullUserCard}
    </div>
  );
}
