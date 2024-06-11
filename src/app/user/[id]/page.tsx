"use client";
import React, { useEffect, useState } from "react";
import {
  followUserDb,
  getDbUserFromId, getPostsByUser,
  isUserFollowing,
  resetUserEmbed,
  updateUserProfile,
} from "~/server/api/queries";
import { useAlertState, useUserState } from "~/app/_functions/store";
import { VscLoading } from "react-icons/vsc";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import PostsPage from "~/app/_components/PostsPage";

export default function UserPage({ params }: { params: { id: string } }) {
  const { user_id, clerk_id } = useUserState((state) => state);
  const [isUser, setIsUser] = useState<boolean>(Number(params.id) === user_id);
  const [userId] = useState<number>(Number(params.id));
  const [fullUserCard, setFullUserCard] = useState<React.ReactElement | null>();
  const [showingPosts, setShowingPosts] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<React.ReactElement | null>();
  const [newBio, setNewBio] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newLocation, setNewLocation] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const setAlert = useAlertState((state) => state.setAlert);

  useEffect(() => {
    if (user_id !== 0) {
      void userCard();
      setIsUser(Number(params.id) === user_id);
    }
    //eslint-disable-next-line
  }, [user_id]);

  useEffect(() => {
    void userCard();
    //eslint-disable-next-line
  }, [isUser]);

  async function viewPosts() {
    console.log(`Viewing posts ${params.id}`);
    const ids = await getPostsByUser(Number(params.id))
    console.log(ids)
    setShowingPosts(true);
    setUserPosts(<PostsPage order={ids} />);
  }

  async function followUser(targetId: number) {
    if (!isUser) {
      void (await followUserDb(user_id, targetId)); // Follow user from DB
      void userCard(); // Refresh user card
    } else {
      console.error("lol");
    }
  }

  async function saveProfile() {
    void (await updateUserProfile(newBio, newLocation, newSkills, newWebsite));
    void userCard();
  }

  async function resetRecs(clerk: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setAlert({ text: "Resetting recommendations", type: "loading" });

    void (await resetUserEmbed(clerk));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setAlert({ text: "Reset recommendations", type: "info" });
  }

  async function userCard() {
    const following = await isUserFollowing(user_id, userId);
    const fullUser = await getDbUserFromId(userId);
    if (fullUser) {
      setNewBio(fullUser.bio || "");
      setNewWebsite(fullUser.website || "");
      setNewSkills(fullUser.skills || "");
      setNewLocation(fullUser.location || "");
    }
    fullUser
      ? setFullUserCard(
          <div
            className={
              "mx-auto flex w-screen flex-col text-center sm:w-[30rem]"
            }
          >
            <div className={"flex flex-row"}>
              <div className={"border-r border-white/50 pl-2 pr-2"}>
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
                  className={`mt-4 rounded-full border-2 px-4 py-1 font-semibold duration-200 ${isUser ? "cursor-not-allowed" : "cursor-pointer"} ${following ? "border-black/20 bg-white text-black hover:border-black/60" : "border-white/20 bg-black text-white hover:border-white/60"}`}
                  onMouseDown={() => followUser(fullUser.id)}
                >
                  {following ? "Following" : "Follow"}
                </button>
              </div>
              <div className={"w-full"}>
                <div
                  className={"mx-auto min-h-28 w-full border-b border-white/50"}
                >
                  <div className={"text-3xl font-semibold"}>
                    {fullUser.name}
                  </div>
                  <div className={"px-2 pt-4 text-left text-base"}>
                    {fullUser.bio ? fullUser.bio : "No bio"}
                  </div>
                </div>
                <div className={"p-2 py-1 text-left"}>
                  <div className={"text-white/95"}>
                    Location:{" "}
                    {fullUser.location ? fullUser.location : "Unknown"}
                  </div>
                  <div className={"text-white/95"}>
                    Website:{" "}
                    {fullUser.website ? (
                      <Link href={`${fullUser.website}`}>
                        {fullUser.website}
                      </Link>
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
                              className="mx-0.5 mb-0.5 ml-0 mt-1 w-fit max-w-32 overflow-x-hidden truncate rounded-sm bg-white/5 p-0.5 text-left text-xs text-zinc-200"
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
        )
      : setFullUserCard(
          <div className={"w-full pt-20 text-center text-xl text-red-600"}>
            USER NOT FOUND{" "}
            <div className={"text-sm text-white underline"}>
              <Link href={"/"}>Go home</Link>
            </div>
          </div>,
        );
  }

  return (
    <div className="h-screen w-screen overflow-y-scroll pb-20 pt-20 text-white">
      {fullUserCard ?? (
        <VscLoading className={"animate-roll mx-auto h-10 w-10"} />
      )}
      {isUser && fullUserCard ? (
        <div
          className={
            "mx-auto mb-20 mt-12 w-screen rounded-xl bg-white/[2%] p-4 text-left backdrop-blur-sm sm:w-[30rem]"
          }
        >
          <div className={"pb-8 text-2xl text-white"}>
            Account settings{" "}
            <span className={"text-xs text-zinc-400"}>
              (only visible to you)
            </span>
          </div>
          <div className={"flex w-full flex-col"}>
            <div className={"flex flex-row justify-between"}>
              <div className={"pt-[11px]"}>Account security</div>
              <div className={""}>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>
            </div>
            <div className={"flex flex-row justify-between py-2"}>
              <div className={"pt-2.5"}>
                Reset recommendations
                <br />
                <span className={"text-xs text-zinc-400"}>
                  This will reset your home page to chronological order until
                  recommendations are re-assigned
                </span>
              </div>
              <div className={""}>
                <button
                  className={
                    "rounded-lg border-2 border-red-400 bg-red-500 px-4 py-2 text-zinc-200 duration-100 hover:bg-red-400 hover:text-white"
                  }
                  onMouseDown={() => resetRecs(clerk_id)}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className={"w-full pt-12"}>
            <div className={"text-base"}>
              <span className={"text-xl"}>Change account details</span>
            </div>
            <div className={"mt-2"}>
              <div>Bio</div>
              <textarea
                className={
                  "h-36 w-3/4 resize-none rounded-lg bg-white/25 p-2 text-white placeholder-zinc-400"
                }
                placeholder={"Enter bio here"}
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
              ></textarea>
            </div>
            <div className={"my-2"}>
              <div>Website</div>
              <input
                className={
                  "w-3/4 rounded-lg bg-white/25 p-2 text-white placeholder-zinc-400"
                }
                placeholder={"Enter website here"}
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
              ></input>
            </div>
            <div className={"my-2"}>
              <div>Skills</div>
              <input
                className={
                  "w-3/4 rounded-lg bg-white/25 p-2 text-white placeholder-zinc-400"
                }
                placeholder={"Separate skills using ,"}
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
              ></input>
            </div>
            <div className={"my-2"}>
              <div>Location</div>
              <input
                className={
                  "w-3/4 rounded-lg bg-white/25 p-2 text-white placeholder-zinc-400"
                }
                placeholder={"Separate skills using ,"}
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              ></input>
            </div>
            <div className={"mt-4"}>
              <button
                className={
                  "rounded-full bg-green-600 px-4 py-2 hover:bg-green-500"
                }
                onMouseDown={() => saveProfile()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {fullUserCard ? (
        <div className={"mx-auto mt-4 w-screen sm:w-[30rem]"}>
          <div
            className={
              "justify-center text-center text-white"
            }
          >
            {!showingPosts ? (
              <button
                className={
                  "mb-12 rounded-lg bg-white/10 px-4 py-2 text-zinc-200 duration-100 hover:bg-white/15 hover:text-white"
                }
                onClick={() => viewPosts()}
              >
                Click to view user&#39;s posts
              </button>
            ) : (
              <></>
            )}
            {showingPosts ? (
              userPosts ?? (
                <VscLoading className={"animate-roll mx-auto h-10 w-10"} />
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
