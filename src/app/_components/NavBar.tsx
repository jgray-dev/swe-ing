import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FaPlusSquare, FaRegUserCircle } from "react-icons/fa";
import { IoHome } from "react-icons/io5";

export default function NavBar() {
  return (
    <div
      className={
        "fixed top-0 z-50 flex h-16 max-h-16 w-full items-center justify-between bg-black/50 p-4 px-8 text-lg font-semibold text-white backdrop-blur-md border-b border-white/50"
      }
    >
      <Link href={"/"}>
        <IoHome className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
      </Link>
      <SignedIn>
        <div>
          <Link href={`/newpost`}>
            <FaPlusSquare className="h-7 w-7 cursor-pointer fill-zinc-400 duration-200 hover:fill-white" />
          </Link>
        </div>
        <div>
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <div className="group flex flex-row pl-4 text-zinc-400 duration-200 hover:text-white">
            <span>Sign in</span>
            <FaRegUserCircle
              className={
                "ml-2 h-7 w-7 cursor-pointer fill-zinc-400 duration-200 group-hover:fill-white"
              }
            />
          </div>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
