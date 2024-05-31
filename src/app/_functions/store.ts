"use client";

import { create } from "zustand";
import { useUser } from "@clerk/clerk-react";
import React from "react";
import { getDbUser } from "~/server/api/queries";

type User = {
  user_id: number;
  clerk_id: string;
  name: string;
  setData: (data: Partial<User>) => void;
};

export const useUserState = create<User>((set) => ({
  user_id: 0,
  clerk_id: "",
  name: "",
  setData: (data) => set(data),
}));

export function UserDataUpdater() {
  const { user, isLoaded, isSignedIn } = useUser();
  const setData = useUserState((state) => state.setData);
  React.useEffect(() => {
    console.log("userState useEffect (iL, iS)", isLoaded, isSignedIn);
    const fetchData = async () => {
      if (user && isSignedIn) {
        try {
          const dbUser = await getDbUser(user.id);
          if (dbUser) {
            setData({
              user_id: dbUser.id,
              clerk_id: user.id,
              name: `${user.fullName}`,
            });
          } else {
            alert("Error getting user data");
            location.reload();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("User not signed in");
      }
    };
    void fetchData();
  }, [isLoaded,isSignedIn, user]);

  return null;
}

type Reply = {
  post_id: number;
  setReplyData: (data: Partial<Reply>) => void;
};

export const useReplyState = create<Reply>((set) => ({
  post_id: 0,
  setReplyData: (data) => set(data),
}));
