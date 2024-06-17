"use client";

import { useEffect } from "react";
import { wakeDatabase } from "~/server/api/queries";

export function KeepAlive() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Waking database");
      void wakeDatabase();
    }, 50000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
