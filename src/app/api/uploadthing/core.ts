import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 3 } })
    .middleware(async () => {
      const user = auth();
      if (!user.userId) throw new UploadThingError("Unauthorized");
      return { user: await clerkClient.users.getUser(`${user.userId}`) };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, userId: `${metadata.user.id}` };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// "use client";
// import { UploadButton } from "~/utils/uploadthing";
// <UploadButton endpoint="imageUploader"/>
