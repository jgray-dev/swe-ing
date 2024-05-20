import HomePage from "~/app/_components/HomePage";
import {RedirectToSignIn, SignedIn, SignedOut} from "@clerk/nextjs";

export default async function Home() {
  return (
    <div className="h-screen w-screen pt-16 text-center text-white">
      <SignedIn >
        <HomePage />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
