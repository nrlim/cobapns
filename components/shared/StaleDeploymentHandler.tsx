"use client";

import { useEffect } from "react";

/**
 * Handles the "Failed to find Server Action" error that occurs when:
 * - A user has an open page from a previous deployment
 * - We redeploy → Server Action hashes change
 * - User submits a form → old hash no longer exists on the new server
 *
 * Solution: detect this error globally and do a hard reload so the user
 * gets the freshest HTML with current Server Action hashes.
 */
export function StaleDeploymentHandler() {
  useEffect(() => {
    const isStaleActionError = (message: string) =>
      message.includes("Failed to find Server Action") ||
      message.includes("This request might be from an older or newer deployment");

    // Catch synchronous errors thrown by the framework
    const handleError = (event: ErrorEvent) => {
      if (isStaleActionError(event.message || "")) {
        event.preventDefault();
        window.location.reload();
      }
    };

    // Catch async/promise-based errors (most Server Action errors land here)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason?.message ||
        (typeof reason === "string" ? reason : "") ||
        "";

      if (isStaleActionError(message)) {
        event.preventDefault();
        // Small delay so any in-flight state updates can settle
        setTimeout(() => window.location.reload(), 100);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
