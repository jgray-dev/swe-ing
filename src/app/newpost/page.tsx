"use server";

import ClientSide from "~/app/newpost/client";

export default async function NewPost() {
  return (
    <div className={"w-screen h-screen pt-16 text-center mx-auto bg-black/50 backdrop-blur-xs text-white"}>
      <ClientSide/>
  </div>
  )
}