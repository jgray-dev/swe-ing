import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  );
}
