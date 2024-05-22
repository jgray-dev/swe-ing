"use client"
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { FaPlusSquare, FaSearch } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import {RiSeedlingLine} from "react-icons/ri";
import {seedAllData} from "~/server/api/queries";



export default function NavBar() {
  
  async function seedData() {
    void await seedAllData()
    alert("finished seeding data")
  }
  return (
    <div
      className={
        "fixed top-0 z-50 flex h-16 max-h-16 w-full items-center justify-between border-b border-white/50 bg-black/60 p-4 px-8 text-lg font-semibold text-white backdrop-blur-md"
      }
    >
      <Link href={"/"}>
        <IoHome className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
      </Link>
      <div onClick={() => seedData()}>
          <RiSeedlingLine  className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
      </div>
      <div>
        <Link href={`/search`}>
          <FaSearch className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
        </Link>
      </div>
      <div>
        <Link href={`/newpost`}>
          <FaPlusSquare className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
        </Link>
      </div>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </div>
    </div>
  );
}
