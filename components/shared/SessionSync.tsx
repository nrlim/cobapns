"use client";

import { useEffect } from "react";
import { refreshSessionAction } from "@/app/actions/auth";

export function SessionSync() {
  useEffect(() => {
    refreshSessionAction().then((res) => {
      if (res.success) {
        // Hard reload so that middleware uses the new JWT token
        window.location.reload();
      }
    });
  }, []);

  return null;
}
