import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { metadata } from "~/app/layout";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = auth();
      if (!user.userId) throw new UploadThingError("Unauthorized");
      return { user: await clerkClient.users.getUser(`${user.userId}`) };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(posts).values({
        authorId: `${metadata.user.id}`,
        imageUrl: file.url,
        firstName: `${metadata.user.firstName}`,
        lastName: `${metadata.user.lastName}`,
      });
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// "use client";
// import { UploadButton } from "~/utils/uploadthing";
// <UploadButton endpoint="imageUploader"/>
