import { db } from "~/server/db";

const mockUrls = [
  "https://utfs.io/f/005ba145-6d2c-45fd-92b8-05cde29662d1-1pyk87.jpg",
  "https://utfs.io/f/95bd0a1b-7235-4690-a7ce-04615a19131f-1pyk89.png",
  "https://utfs.io/f/2ac2f9ec-5c09-4367-8b81-bb67bdfd530d-1pyk88.jpg",
];
const mockImages = mockUrls.map((url, index) => ({
  id: index + 1,
  url,
}));

export default async function Home() {
  const posts = await db.query.posts.findMany();

  return (
    <main className="h-screen w-screen bg-zinc-900 text-white">
      <div className="flex flex-wrap gap-4">
        {posts.map((post, index) => {
          return <div key={index}>{post.name}</div>;
        })}
        {[...mockImages, ...mockImages, ...mockImages, ...mockImages].map(
          (image, index) => (
            <div key={image.id + "-" + index} className="w-48">
              <img src={image.url} alt={`Image ${image.id}`} />
            </div>
          ),
        )}
      </div>
    </main>
  );
}
