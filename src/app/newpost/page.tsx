"use server";

import ClientSide from "~/app/newpost/client";

export default async function NewPost() {
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
