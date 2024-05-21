"use server";

import ClientSide from "~/app/newpost/client";

export default async function NewPost() {
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
