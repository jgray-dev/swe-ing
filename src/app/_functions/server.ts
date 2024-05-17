"use server";

import {clerkClient} from "@clerk/nextjs/server";


export async function getNameFromId(queryId: number) {
  return clerkClient.users.getUser(`${queryId}`)
}