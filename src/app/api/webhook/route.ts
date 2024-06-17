import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { webhookRequest } from "~/app/_functions/interfaces";
import {
  createProfile,
  deleteProfile,
  updateProfile,
} from "~/server/api/queries";
import { clerkClient } from "@clerk/nextjs/server";

const webhookSecret: string | undefined = process.env.WEBHOOK_SECRET;

export async function handler(req: Request) {
  if (req.method === "POST" || req.method == "OPTIONS") {
    try {
      if (!webhookSecret) {
        return new Response("Secret not set", { status: 500 });
      }
      const svix_id = req.headers.get("svix-id") ?? "";
      const svix_timestamp = req.headers.get("svix-timestamp") ?? "";
      const svix_signature = req.headers.get("svix-signature") ?? "";
      const body = await req.text();
      const sivx = new Webhook(webhookSecret);
      let msg;

      try {
        msg = sivx.verify(body, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        return new Response("Bad Request", { status: 400 });
      }
      msg = msg as webhookRequest;
      console.log("Verified webhook request for user " + msg.data.id);

      try {
        if (msg.type === "user.updated") {
          await updateProfile(msg);
        }
        if (msg.type === "user.created") {
          const newUser = await createProfile(msg);
          if (newUser?.[0]?.id) {
            await clerkClient.users.updateUserMetadata(msg.data.id, {
              publicMetadata: {
                database_id: newUser[0].id,
              },
            });
          }
        }
        if (msg.type === "user.deleted") {
          await deleteProfile(msg);
        }
      } catch {
        return new Response("Error calling functions", { status: 500 });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json({ error: "Invalid method" }, { status: 405 });
  }
}

export { handler as POST };
