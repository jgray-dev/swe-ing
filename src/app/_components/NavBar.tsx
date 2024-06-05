"use client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { seedAllData, updateEmbed } from "~/server/api/queries";

import { IoHomeOutline } from "react-icons/io5";
import { TfiReload } from "react-icons/tfi";
import { HiOutlineXMark } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";
import { CiSquarePlus } from "react-icons/ci";
import { useAlertState, useUserState } from "~/app/_functions/store";
import { VscAccount } from "react-icons/vsc";

export default function NavBar() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const setAlert = useAlertState((state) => state.setAlert);
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { user_id } = useUserState((state) => state);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  async function refreshEmbed() {
    // void seedAllData()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setAlert({ text: "Refreshing recommendations", type: "loading" });
    const resp = await updateEmbed();
    if (resp === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "Failed to refresh recommendations", type: "error" });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setAlert({ text: "Refreshed recommendations", type: "info" });
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  function submitSearch() {
    setSearchQuery("");
    // console.log(searchQuery);
    setSearchOpen(false);
    router.push(`/search/${searchQuery}`);
  }

  return (
    <div
      className={
        "fixed top-0 z-50 flex h-16 max-h-16 w-full items-center justify-between border-b border-white/50 bg-black/60 p-4 px-8 text-lg font-semibold text-white backdrop-blur-md"
      }
    >
      {!searchOpen ? (
        <>
          <Link href={"/"} title={"Home"}>
            <IoHomeOutline className="h-7 w-7 cursor-pointer stroke-zinc-400 duration-200 hover:stroke-white" />
          </Link>
          <div
            onMouseDown={() => refreshEmbed()}
            title={"Refresh recommendations"}
          >
            <TfiReload className="uration-500 h-7 w-7 cursor-pointer fill-zinc-400 duration-200 ease-in-out hover:-rotate-180 hover:fill-white" />
          </div>
          <div title={"Search posts"}>
            <IoIosSearch
              className="h-9 w-9 cursor-pointer fill-zinc-400 duration-200 hover:fill-white"
              onMouseDown={() => setSearchOpen(true)}
            />
          </div>
          <div title={"Create new post"}>
            <Link href={`/newpost`}>
              <CiSquarePlus className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
            </Link>
          </div>
          <div title={"Manage account"} className={"flex flex-row"}>
            <span className={"mr-2 mt-1 text-xs text-zinc-800"}>{user_id}</span>
            <SignedIn>
              <div className="h-fit min-w-8">
                <Link href={`/user/${user_id}`}>
                  <VscAccount
                    className={
                      "h-6 w-6 text-zinc-400 duration-200 hover:text-white"
                    }
                  />
                </Link>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton>Sign in</SignInButton>
            </SignedOut>
          </div>
        </>
      ) : (
        <div className="mx-auto flex flex-row">
          <input
            type="text"
            placeholder="Enter search"
            className="sm:max-w-3/4 max-w-screen h-8 min-w-72 rounded-full border-white/40 bg-white/20 p-2 text-sm placeholder-white/30 focus:border focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            onKeyDown={(e) => {
              e.key == "Enter" ? submitSearch() : null;
            }}
          ></input>
          <IoIosSearch
            className="mt-0.5 h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-green-700 sm:ml-3 sm:mr-3"
            onMouseDown={() => submitSearch()}
            title={`Search for ${searchQuery}`}
          />
          <HiOutlineXMark
            className="mb-0.5 h-8 w-8 cursor-pointer stroke-zinc-400 hover:stroke-red-400"
            onMouseDown={() => setSearchOpen(false)}
            title={`Cancel search`}
          />
        </div>
      )}
    </div>
  );
}
