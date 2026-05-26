"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Loader } from "@/components/ui/loader";

export default function DashboardLoading() {
  return (
    <Section size="sm" className="flex-1 flex flex-col pt-6">
      <Container className="space-y-6 flex-1 flex flex-col">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>

        {/* Progress Bar Loader */}
        <Loader variant="bar" size="md" color="accent" className="opacity-60" />

        {/* Main Content Grid skeleton */}
        <Grid cols={1} mdCols={3} gap={6} className="items-start flex-1 mt-6">
          <div className="md:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card/25 space-y-4">
              <Skeleton className="h-5 w-32 rounded" />
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-[75%] rounded" />
              </div>
            </div>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}

function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border bg-card/20 space-y-3 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3 w-full rounded" />
        </div>
        <Skeleton className="h-4.5 w-16 rounded-full" />
      </div>
      <div className="flex gap-4 border-t border-border/10 pt-3">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-3.5 w-24 rounded" />
      </div>
    </div>
  );
}
