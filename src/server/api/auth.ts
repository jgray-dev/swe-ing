"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { users } from "~/server/db/schema";
import type { user } from "~/app/_functions/interfaces";

// Pass in a user object. Returns true if the user requesting the action is authorized against the action user or the action user IS the requesting user
export async function checkAuthorized(user: user | null): Promise<boolean> {
  if (!user) {
    console.log("Authorization failed: User is null");
    return false;
  }
  if (!user.permission) {
    console.log("Authorization failed: User has no permission");
    return false;
  }
  const clerkUser = await clerkClient.users.getUser(`${auth().userId}`);
  // Find our action user in the database
  const actionUser = await db.query.users.findFirst({
    where: eq(users.id, Number(clerkUser.publicMetadata.database_id)),
  });
  // No actionUser found
  if (!actionUser) {
    console.log("Authorization failed: No action user found");
    return false;
  }
  // In the event the action user is not the same as the user supplied in the request,
  // check if the action user has greater permission than the requested user
  // also check if the action user has permission level required (>1)
  if (
    clerkUser.publicMetadata.database_id !== user.id &&
    actionUser.permission <= user.permission &&
    actionUser.permission <= 1
  ) {
    console.log("Authorization failed: Insufficient permissions for action user");
    return false;
  }
  // Final check to return true ONLY if the action user is greater permission than the requested user
  // (ex moderators cant force anything on admins posts)
  if (actionUser.permission < user.permission) {
    console.log("Authorization failed: Action user has lower permission than requested user");
    return false;
  }
  return true;
}
