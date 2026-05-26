"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AlertCircle, RotateCcw, Home, ChevronDown } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showTrace, setShowTrace] = React.useState(false);

  React.useEffect(() => {
    // Log error to monitoring logs if available
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <Section size="md" className="flex-grow flex items-center justify-center min-h-[75vh]">
      <Container className="max-w-md w-full p-4 relative">
        <div className="absolute top-[-10%] left-[-15%] w-64 h-64 rounded-full bg-destructive/10 blur-[80px] pointer-events-none" />

        <Card glass className="border-t-4 border-t-destructive shadow-glow-strong overflow-hidden relative z-10">
          <CardHeader className="text-center p-6 pb-2">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 border border-destructive/20 animate-pulse">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">Workspace Runtime Error</CardTitle>
            <CardDescription className="text-xs leading-normal">
              An unexpected exception was caught in the frontend routing lifecycle logs.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-4 space-y-4 text-center">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/15 text-[11px] text-destructive font-mono truncate">
              {error.message || "Unknown rendering exception"}
            </div>

            {/* Expandable technical details */}
            <div className="text-left">
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5 mx-auto transition-colors"
              >
                {showTrace ? "Hide system logs" : "Inspect system trace logs"}
                {showTrace ? <ChevronDown className="h-3 w-3 rotate-180 transition-transform" /> : <ChevronDown className="h-3 w-3 transition-transform" />}
              </button>
              
              {showTrace && (
                <div className="mt-2.5 p-3 rounded-lg bg-black/90 dark:bg-black/95 text-[10px] text-zinc-400 font-mono overflow-auto max-h-40 border border-zinc-800 leading-normal animate-in fade-in duration-200">
                  <span className="font-bold text-zinc-500 block mb-1">DIGEST: {error.digest || "N/A"}</span>
                  <pre className="whitespace-pre-wrap">{error.stack || "No callstack details available."}</pre>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-muted/10 justify-center gap-3 border-t border-border/20 h-14">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-xs font-semibold h-8 rounded-lg active:scale-95 flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-compile page
            </Button>
            <Link href="/dashboard">
              <Button
                variant="gradient"
                size="sm"
                className="text-xs font-semibold h-8 rounded-lg active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <Home className="h-3.5 w-3.5" /> Workspace dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </Container>
    </Section>
  );
}
