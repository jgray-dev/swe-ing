import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { safeParseJSON } from "@uploadthing/shared";
import {
  createProfile,
  deleteProfile,
  type profile,
  updateProfile,
} from "~/server/api/queries";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
      const reader = req.body.getReader();
      const chunks = [];
      while (true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const bodyBuffer = Buffer.concat(chunks);
      const bodyText = bodyBuffer.toString("utf-8");
      const jsonBody = await safeParseJSON(bodyText);
      // console.log('Request Body:', jsonBody);
      const body = jsonBody as profile;
      if (body.type === "user.updated") {
        void updateProfile(body);
      }
      if (body.type === "user.created") {
        void createProfile(body);
      }
      if (body.type === "user.delete") {
        void deleteProfile(body);
      }

      return NextResponse.json(
        { message: "Webhook received" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  } else {
    res.setHeader("Allow", "POST");
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
}

export { handler as POST };
