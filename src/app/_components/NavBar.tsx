"use client";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { FaPlusSquare } from "react-icons/fa";
import {IoHome, IoHomeOutline} from "react-icons/io5";
import { updateEmbed } from "~/server/api/queries";
import { TfiReload } from "react-icons/tfi";
import { useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";
import { useRouter } from "next/navigation";
import {CiSquarePlus} from "react-icons/ci";

export default function NavBar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function refreshEmbed() {
    const resp = await updateEmbed();
    if (resp === 0) {
      alert("Failed to refresh user embed (user?.userId)");
    } else {
      console.info("Refreshed user's embed.");
    }
  }

  function submitSearch() {
    router.push(`/search/${searchQuery}`);
    setSearchQuery("")
    console.log(searchQuery);
    setSearchOpen(false);
  }

  return (
    <div
      className={
        "fixed top-0 z-50 flex h-16 max-h-16 w-full items-center justify-between border-b border-white/50 bg-black/60 p-4 px-8 text-lg font-semibold text-white backdrop-blur-md"
      }
    >
      {!searchOpen ? (
        <>
          <Link href={"/"}>
            <IoHomeOutline className="h-7 w-7 cursor-pointer stroke-zinc-400 duration-200 hover:stroke-white" />
          </Link>
          <div onClick={() => refreshEmbed()}>
            <TfiReload className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
          </div>
          <div>
            <IoIosSearch
              className="h-9 w-9 cursor-pointer fill-zinc-400 duration-200 hover:fill-white"
              onClick={() => setSearchOpen(true)}
            />
          </div>
          <div>
            <Link href={`/newpost`}>
              <CiSquarePlus className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
            </Link>
          </div>
          <div>
            <SignedIn>
              <div className="h-fit min-w-8 pt-1.5">
                <UserButton />
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
            onClick={() => submitSearch()}
            title={`Search for ${searchQuery}`}
          />
          <HiOutlineXMark
            className="mb-0.5 h-8 w-8 cursor-pointer stroke-zinc-400 hover:stroke-red-400"
            onClick={() => setSearchOpen(false)}
            title={`Cancel search`}
          />
        </div>
      )}
    </div>
  );
}
