"use client";

import * as React from "react";
import { useAssessmentStore } from "@/store";
import Link from "next/link";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid } from "@/components/layout/grid";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerChild } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  ArrowRight, 
  Layers, 
  Brain, 
  CheckCircle2, 
  Users, 
  Clock, 
  BookOpen,
  ArrowUpRight,
  History,
  Trash2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface ExtendedAssessment {
  _id: string;
  title: string;
  subject: string;
  classGrade: string;
  dueDate: string;
  numQuestions?: number;
  marks?: number;
  difficulty?: {
    beginner: number;
    intermediate: number;
    expert: number;
  };
  formats?: string[];
  status: 'draft' | 'published' | 'archived' | 'scheduled' | 'failed' | string;
  createdBy: string;
  questions?: any[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  averageScore?: string;
  submissions?: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { 
    assessments, 
    isLoading, 
    fetchAssessmentsAsync, 
    removeAssessmentAsync, 
    retryAssessmentAsync 
  } = useAssessmentStore();

  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAssessmentsAsync().catch((err) => {
      console.error("Failed to load assessments:", err);
    });
  }, [fetchAssessmentsAsync]);

  const allAssessments = assessments as unknown as ExtendedAssessment[];

  // Determine greeting based on local time
  const greeting = React.useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Dynamic Workspace Metrics
  const { totalCount, publishedCount, draftCount, failedCount } = React.useMemo(() => {
    return {
      totalCount: allAssessments.length,
      publishedCount: allAssessments.filter(a => a.status === 'published').length,
      draftCount: allAssessments.filter(a => a.status === 'draft').length,
      failedCount: allAssessments.filter(a => a.status === 'failed').length,
    };
  }, [allAssessments]);

  const recentAssessments = React.useMemo(() => {
    return allAssessments.slice(0, 5);
  }, [allAssessments]);

  const handleDelete = React.useCallback(async (id: string) => {
    const target = allAssessments.find((a) => a._id === id);
    try {
      await removeAssessmentAsync(id);
      toast({
        title: "Assessment Deleted",
        description: `'${target?.title || "Assessment"}' catalog entry has been removed.`,
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error?.message || "Failed to remove the assessment. Reverted visual state.",
        variant: "destructive",
      });
    }
  }, [allAssessments, removeAssessmentAsync, toast]);

  const handleRetry = React.useCallback(async (id: string) => {
    setRetryingId(id);
    const target = allAssessments.find((a) => a._id === id);
    try {
      await retryAssessmentAsync(id);
      toast({
        title: "AI Pipeline Retriggered",
        description: `Re-scheduled generation for '${target?.title}'.`,
        variant: "success" as any,
      });
    } catch (error: any) {
      toast({
        title: "Retry Failed",
        description: error?.message || "Failed to trigger AI generation retry.",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  }, [allAssessments, retryAssessmentAsync, toast]);

  return (
    <Section size="sm" className="flex-1 flex flex-col pt-6">
      <Container className="space-y-8 flex-1 flex flex-col">
        {/* --- WELCOME BANNER PANEL --- */}
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-veda-purple-500/10 via-veda-indigo-500/5 to-transparent p-6 sm:p-8 overflow-hidden shadow-glass-shadow">
          <div className="absolute top-[-20%] right-[-5%] w-64 h-64 rounded-full bg-veda-purple-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[15%] w-48 h-48 rounded-full bg-veda-indigo-500/10 blur-[60px] pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <Badge variant="gradient" className="mb-3">
              AI Agent Sync Active
            </Badge>
            <Heading variant="h2" as="h1" className="text-3xl font-extrabold sm:text-4xl tracking-tight leading-none">
              {greeting}, Raushan!
            </Heading>
            <Text variant="lead" className="text-muted-foreground text-sm sm:text-base mt-2 font-light">
              Welcome back to your workspace. What topics would you like to formulate into interactive quiz challenges today? Let our AI agents draft the assessment framework for you.
            </Text>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/create">
                <Button variant="gradient" size="sm" className="rounded-full shadow-sm">
                  <Plus className="h-4 w-4 mr-1" /> New Assessment
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="glass" size="sm" className="rounded-full">
                  History Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- CORE STATS METRICS GRID --- */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3.5">
            Workspace KPIs
          </span>
          <Grid cols={1} smCols={2} mdCols={4} gap={4}>
            {/* Stat 1 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-veda-purple-500 hover:scale-[1.01] transition-transform">
              <div className="space-y-1 w-full">
                <span className="text-xs text-muted-foreground font-medium">Total Assessments</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 my-1" />
                ) : (
                  <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">{totalCount}</Heading>
                )}
                <span className="text-[10px] text-muted-foreground font-medium">All generated papers</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-veda-purple-500/10 flex items-center justify-center text-primary shrink-0">
                <Brain className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 2 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 hover:scale-[1.01] transition-transform">
              <div className="space-y-1 w-full">
                <span className="text-xs text-muted-foreground font-medium">Ready / Published</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 my-1" />
                ) : (
                  <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">{publishedCount}</Heading>
                )}
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Fully compiled
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 3 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-veda-indigo-500 hover:scale-[1.01] transition-transform">
              <div className="space-y-1 w-full">
                <span className="text-xs text-muted-foreground font-medium">In Progress (Draft)</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 my-1" />
                ) : (
                  <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">{draftCount}</Heading>
                )}
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${draftCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
                  <Clock className="h-3 w-3" /> {draftCount > 0 ? "Compiling..." : "Idle"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-veda-indigo-500/10 flex items-center justify-center text-accent shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 4 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-destructive hover:scale-[1.01] transition-transform">
              <div className="space-y-1 w-full">
                <span className="text-xs text-muted-foreground font-medium">Failed Generations</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 my-1" />
                ) : (
                  <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">{failedCount}</Heading>
                )}
                <span className={`text-[10px] font-semibold ${failedCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  Requires attention
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
            </Card>
          </Grid>
        </div>

        {/* --- MAIN SPLIT PANEL (RECENT LISTINGS VS SHORTCUTS) --- */}
        <Grid cols={1} lgCols={3} gap={6} className="items-start">
          {/* Recent Generations list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Generations
                </span>
              </div>
              <Link href="/history" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
                See all history <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <Card key={n} glass className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : recentAssessments.length === 0 ? (
              <Card glass className="p-8 text-center space-y-4 border border-border/40">
                <Brain className="h-12 w-12 text-muted-foreground/45 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <Heading variant="h3" className="text-base font-bold">No Assessments Found</Heading>
                  <Text className="text-xs text-muted-foreground">
                    You haven't formulated any exam sheets yet. Let Veda AI build your first one!
                  </Text>
                </div>
                <Link href="/create">
                  <Button variant="gradient" size="sm" className="rounded-full text-xs px-5 shadow-md">
                    Create New Assessment
                  </Button>
                </Link>
              </Card>
            ) : (
              <StaggerContainer className="space-y-3">
                {recentAssessments.map((assessment) => {
                  const difficultyTag = assessment.tags?.[0] || "intermediate";
                  const diffBadges = {
                    beginner: "success" as const,
                    intermediate: "info" as const,
                    expert: "warning" as const,
                  };

                  return (
                    <StaggerChild key={assessment._id}>
                      <Card glass hover className="border border-border/40 shadow-sm hover:shadow-glow transition-all duration-300">
                        <CardHeader className="p-5 pb-2 flex-row justify-between items-start space-y-0 gap-3">
                          <div className="space-y-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate leading-none">
                              {assessment.title}
                            </CardTitle>
                            <CardDescription className="text-xs truncate max-w-md">
                              Subject: {assessment.subject} • Class: {assessment.classGrade}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {assessment.status === 'draft' && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] uppercase tracking-wider px-2 py-0.5 animate-pulse border-primary/20">
                                Compiling...
                              </Badge>
                            )}
                            {assessment.status === 'failed' && (
                              <Badge variant="destructive" className="text-[9px] uppercase tracking-wider px-2 py-0.5 border-destructive/20">
                                Failed
                              </Badge>
                            )}
                            {assessment.status === 'published' && (
                              <Badge variant="success" className="text-[9px] uppercase tracking-wider px-2 py-0.5 border-emerald-500/20">
                                Ready
                              </Badge>
                            )}
                            <Badge variant={diffBadges[difficultyTag as keyof typeof diffBadges]} className="text-[9px] uppercase tracking-wider px-2 py-0.5">
                              {difficultyTag}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 pb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-medium border-b border-border/10">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 opacity-70 text-primary shrink-0" />
                            {assessment.numQuestions || assessment.questions?.length || 0} Questions
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 opacity-70 text-accent shrink-0" />
                            {assessment.submissions || 0} submissions
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 opacity-70 text-muted-foreground shrink-0" />
                            {assessment.createdAt ? new Date(assessment.createdAt).toISOString().split('T')[0] : "N/A"}
                          </span>
                        </CardContent>
                        <CardFooter className="p-4 justify-between items-center text-xs mt-auto bg-muted/10 h-12 rounded-b-xl">
                          <span className="text-[11px] text-muted-foreground">
                            Weight: <strong className="text-foreground">{assessment.marks || 0} Pts</strong>
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {/* Retry Action for Failed / Draft */}
                            {(assessment.status === 'failed' || assessment.status === 'draft') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={retryingId === assessment._id}
                                onClick={() => handleRetry(assessment._id)}
                                className="h-8 text-xs font-semibold px-2.5 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground rounded-md flex items-center gap-1"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${retryingId === assessment._id ? "animate-spin" : ""}`} /> Retry
                              </Button>
                            )}

                            {/* Delete Alert Confirmation Dialog */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Assessment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete '{assessment.title}'? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(assessment._id)}
                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Link review / live preview */}
                            <Link href={`/preview/${assessment._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-1">
                                {assessment.status === 'draft' ? "Watch Live" : "Preview"} <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardFooter>
                      </Card>
                    </StaggerChild>
                  );
                })}
              </StaggerContainer>
            )}
          </div>

          {/* Quick Actions / Activity log */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Quick Shortcuts
            </span>
            <Card glass className="p-4 space-y-3.5">
              <div className="space-y-2">
                <Text variant="small" className="text-muted-foreground block uppercase text-[10px] tracking-wider font-bold">Design Shortcuts</Text>
                <div className="flex flex-col gap-2">
                  <Link href="/create">
                    <span className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all text-xs font-medium cursor-pointer group">
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" /> Create Assessment Wizard
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                  <Link href="/history">
                    <span className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all text-xs font-medium cursor-pointer group">
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4 text-accent" /> View History Catalog
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-border/20">
                <Text variant="small" className="text-muted-foreground block uppercase text-[10px] tracking-wider font-bold">Assessment Creator Spec</Text>
                <Text variant="muted" className="text-[11px] leading-relaxed">
                  Generated assessments are compiled by state-of-the-art LLMs, creating randomized multiple-choice layouts, true/false checkmarks, short paragraphs, and fully-executable coding tests. Auto-grading pipelines queue immediately upon candidate submission syncs.
                </Text>
              </div>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
