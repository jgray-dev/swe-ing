import "~/styles/globals.css";
import "@uploadthing/react/styles.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "~/app/_components/NavBar";
import React from "react";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { Alert, UserDataUpdater } from "~/app/_functions/store";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Sweing",
  description: "The social network focused on developers and tech enthusiasts",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <UserDataUpdater />
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className={"bg-black"}>
          <Alert />
          <TRPCReactProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <NavBar />
            <Analytics />
            <div className="bg-black/85">{children}</div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
