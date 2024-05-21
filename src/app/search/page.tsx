"use server";

import ClientSide from "~/app/search/client";

export default async function Search() {
  return (
    <div
      className={
        "mx-auto h-screen w-screen bg-black/50 pt-16 text-center text-white backdrop-blur-sm"
      }
    >
      <ClientSide />
    </div>
  );
}
