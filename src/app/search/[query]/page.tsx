"use client";

import { useEffect, useState } from "react";
import { searchEmbeddings } from "~/server/api/queries";

export default function SearchPage({ params }: { params: { query: string } }) {
  const [end, setEnd] = useState(false);
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const query = decodeURIComponent(params.query);

  useEffect(() => {
    void getData();
  }, []);

  async function getData() {
    if (!end) {
      const results = await searchEmbeddings(query);
      if (results.length === 0) {
        setEnd(true);
      }
      console.log(results);
    } else {
      console.warn("End of results");
      //TODO: Alert end of results
    }
  }
  return (
    <div className="h-screen w-screen pt-16 text-center text-lg text-white">
      <div>{query}</div>
      <button
        className="rounded-md border border-zinc-300 bg-black/50 px-4 py-2 text-zinc-300 backdrop-blur-sm hover:border-white hover:text-white"
        onMouseDown={() => getData()}
      >
        Load more results
      </button>
    </div>
  );
}
