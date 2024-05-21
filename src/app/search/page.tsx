"use server";

import ClientSide from "~/app/search/client";

export default async function Search() {
  return (
    <div
      className={
        "backdrop-blur-sm h-screen w-screen mx-auto bg-black/50 pt-16 text-center text-white"
      }
    >
      <ClientSide />
    </div>
  );
}
