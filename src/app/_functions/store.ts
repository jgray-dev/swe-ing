"use client";

import { create } from "zustand";
import { useUser } from "@clerk/shared/react";
import React from "react";
import { getDbUser, updateUserEmbed } from "~/server/api/queries";

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
  const { user } = useUser();
  const setData = useUserState((state) => state.setData);

  React.useEffect(() => {
    if (user) {
      void (async () => {
        const dbUser = await getDbUser(user.id);
        if (!dbUser) {
          location.reload()
        }
        setData({
          user_id: dbUser?.id,
          clerk_id: user.id,
          name: `${user.fullName}`,
        });
      })();
    }
  }, [user, setData]);

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
