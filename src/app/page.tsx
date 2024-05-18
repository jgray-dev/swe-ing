import { api } from "~/trpc/server";
import HomePage from "~/app/_components/HomePage";

export default async function Home() {
  const allPosts = await api.posts.getHomePage({ page: 1 });
  console.log(allPosts);
  return (
    <div className="h-screen w-screen pt-16 text-white text-center">
      <HomePage />
    </div>
  );
}
