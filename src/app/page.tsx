// import { api } from "~/trpc/server";
import HomePage from "~/app/_components/HomePage";

export default async function Home() {
  return (
    <div className="h-screen w-screen pt-16 text-white text-center">
      <HomePage />
    </div>
  );
}
