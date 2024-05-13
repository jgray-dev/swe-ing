import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <div
      className={
        "flex w-full items-center justify-between bg-black p-4 text-lg font-semibold text-white"
      }
    >
      <div>swe.ing app</div>
      <div>
        <SignedIn>
          <div>
            <Link href={`/newpost`}>Create new post</Link>
          </div>
          <div>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  );
}
