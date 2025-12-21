"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global Error Page with Sentry Integration
 * 
 * This catches unhandled errors in the app and:
 * 1. Reports them to Sentry with context
 * 2. Shows a user-friendly error message
 * 3. Provides a way to recover (reload)
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report error to Sentry
        Sentry.captureException(error, {
            tags: {
                errorType: "global-error",
                digest: error.digest,
            },
            extra: {
                componentStack: error.stack,
            },
        });
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    backgroundColor: "#0f172a",
                    color: "#e2e8f0",
                }}>
                    <div style={{
                        maxWidth: "480px",
                        textAlign: "center",
                    }}>
                        <div style={{
                            fontSize: "4rem",
                            marginBottom: "1rem",
                        }}>
                            😵
                        </div>
                        <h1 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                            color: "#f8fafc",
                        }}>
                            Something went wrong
                        </h1>
                        <p style={{
                            color: "#94a3b8",
                            marginBottom: "1.5rem",
                            lineHeight: "1.6",
                        }}>
                            We've been notified and are working on it.
                            Please try again or contact support if the problem persists.
                        </p>

                        {/* Error digest for support reference */}
                        {error.digest && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginBottom: "1.5rem",
                                fontFamily: "monospace",
                            }}>
                                Error ID: {error.digest}
                            </p>
                        )}

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button
                                onClick={() => reset()}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                    backgroundColor: "#38bdf8",
                                    color: "#0f172a",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0ea5e9"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#38bdf8"}
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => window.location.href = "/"}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                    backgroundColor: "transparent",
                                    color: "#38bdf8",
                                    border: "1px solid #38bdf8",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(56, 189, 248, 0.1)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Go home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
