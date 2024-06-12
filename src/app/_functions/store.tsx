"use client";

import { create } from "zustand";
import { useUser } from "@clerk/clerk-react";
import React from "react";
import { getDbUser } from "~/server/api/queries";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { TailSpin } from "react-loading-icons";

type User = {
  user_id: number;
  permission: number;
  clerk_id: string;
  name: string;
  setData: (data: Partial<User>) => void;
};
export const useUserState = create<User & { isLoaded: boolean }>((set) => ({
  user_id: 0,
  permission: 0,
  clerk_id: "",
  name: "",
  isLoaded: false,
  setData: (data) => set({ ...data, isLoaded: true }),
}));

export function UserDataUpdater() {
  const { user, isLoaded, isSignedIn } = useUser();
  const setData = useUserState((state) => state.setData);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (isLoaded) {
        console.log("Clerk state loaded");
        if (!isLoading) {
          console.log("Local loading is false");
          if (isSignedIn) {
            console.log("Clerk is signed in");
            setIsLoading(true);
            try {
              console.log("Trying dbUser");
              const dbUser = await getDbUser(user.id);
              console.log("Finished dbUser", dbUser);
              if (dbUser) {
                console.log("We got dbUser");
                setData({
                  user_id: dbUser.id,
                  clerk_id: user.id,
                  name: `${user.fullName}`,
                  permission: dbUser.permission
                });
              } else {
                console.log("We DONT got dbUser - reload page");
                alert("Error getting user data");
                location.reload();
              }
            } catch (error) {
              console.log("Caught error:");
              console.error("Error fetching user data:", error);
            } finally {
              console.log("Finally not loading");
              setIsLoading(false);
            }
          } else {
            console.log("User not signed in");
          }
        } else {
          console.log("Already loading user data");
        }
      } else {
        console.log("Clerk state loading");
      }
    };
    void fetchData();
    //eslint-disable-next-line
  }, [isLoaded, isSignedIn, user]);

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

type Alert = {
  text: string;
  type: "info" | "warn" | "error" | "loading" | "";
  setAlert: (data: Partial<Alert>) => void;
};

export const useAlertState = create<Alert>((set) => ({
  text: "",
  type: "",
  setAlert: (data) => set({ ...data }),
}));

export function Alert() {
  const { text, type, setAlert } = useAlertState((state) => state);
  const lastUpdateRef = React.useRef(Date.now());

  React.useEffect(() => {
    if (text !== "" && type !== "") {
      lastUpdateRef.current = Date.now();
    }
  }, [text, type]);

  React.useEffect(() => {
    const checkTimeout = () => {
      const timeElapsed = Date.now() - lastUpdateRef.current;
      if (timeElapsed >= 10000) {
        setAlert({ text: "" });
      } else {
        setTimeout(checkTimeout, 10000 - timeElapsed);
      }
    };
    checkTimeout();
    // @ts-expect-error fts
    return () => clearTimeout(checkTimeout);
  }, [setAlert]);

  if (text === "" || type === "") return null;
  const icons = {
    info: (
      <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
    ),
    warn: (
      <ExclamationTriangleIcon
        className="h-5 w-5 text-orange-500"
        aria-hidden="true"
      />
    ),
    error: <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
    loading: (
      <TailSpin stroke="#0e7490" className="h-5 w-5" aria-hidden="true" />
    ),
  };

  const bgcolor = {
    info: "bg-green-100",
    warn: "bg-orange-100",
    error: "bg-red-100",
    loading: "bg-cyan-100",
    "": "",
  };

  const textcolor = {
    info: "text-green-700",
    warn: "text-orange-700",
    error: "text-red-700",
    loading: "text-cyan-700",
    "": "",
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 h-fit bg-black shadow-xl shadow-black">
      <div className={`rounded-md bg-green-50 ${bgcolor[type]} p-4`}>
        <div className="flex">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${textcolor[type]}`}>{text}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md ${bgcolor[type]}  p-1.5 ${textcolor[type]} hover:bg-opacity-60`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                  onClick={() => setAlert({ text: "" })}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
