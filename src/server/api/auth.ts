"use server";

import {auth, clerkClient} from "@clerk/nextjs/server";
import {db} from "~/server/db";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {users} from "~/server/db/schema";
import type {user} from "~/app/_functions/interfaces";

export async function checkAuthorized(user: user | null): Promise<boolean> {
  if (!user) return false;
  if (!user.permission) return false;
  //Default returns if user is null
  
  // Check the clerk user making the request
  const clerkUser = await clerkClient.users.getUser(`${auth().userId}`);
  // Find our action user in the database
  const actionUser = await db.query.users.findFirst({
    where: eq(users.id, Number(clerkUser.publicMetadata.database_id)),
  });
  // No actionUser found
  if (!actionUser) return false;
  
  // In the event the action user is not the same as the user supplied in the request,
  // check if the action user has greater permission than the requested user
  // also check if the action user has permission level required (>1)
  if (
    clerkUser.publicMetadata.database_id !== user.id 
    && actionUser.permission <= user.permission
    && actionUser.permission <= 1
  ) {
    return false;
  }
  
  // Final check to return true ONLY if the action user is greter permission than the requested user
  // (ex moderators cant force anything on admins posts)
  return actionUser.permission >= user.permission;
}