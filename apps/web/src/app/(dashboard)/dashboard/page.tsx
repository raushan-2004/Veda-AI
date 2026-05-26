"use client";

import * as React from "react";
import Link from "next/link";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid } from "@/components/layout/grid";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerChild } from "@/components/ui/motion";
import { 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Clock, 
  BookOpen,
  ArrowUpRight,
  History
} from "lucide-react";

// Mock recent assessments data
const recentAssessments = [
  {
    id: "react-basics",
    title: "React Fundamentals",
    description: "Covers hooks, virtual DOM, and component lifecycles.",
    difficulty: "intermediate",
    questions: 10,
    created: "2 hours ago",
    averageScore: "88%",
    submissions: 24,
  },
  {
    id: "node-apis",
    title: "Express API Engineering",
    description: "Middleware routing, rate limiters, and error handlers.",
    difficulty: "expert",
    questions: 15,
    created: "2 days ago",
    averageScore: "74%",
    submissions: 18,
  },
  {
    id: "mongo-intro",
    title: "MongoDB Schema Modeling",
    description: "Document structures, indexing strategies, and pipelines.",
    difficulty: "beginner",
    questions: 8,
    created: "5 days ago",
    averageScore: "91%",
    submissions: 32,
  },
];

export default function DashboardPage() {
  // Determine greeting based on local time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

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
              {getGreeting()}, Raushan!
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
              <Link href="/design-system">
                <Button variant="glass" size="sm" className="rounded-full">
                  Visual Sandbox
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
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-veda-purple-500 hover:scale-[1.01]">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Tests Generated</span>
                <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">18</Heading>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12% this week
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-veda-purple-500/10 flex items-center justify-center text-primary">
                <Brain className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 2 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 hover:scale-[1.01]">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Graded Submissions</span>
                <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">142</Heading>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  Avg score: <strong className="text-foreground">84%</strong>
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 3 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-veda-indigo-500 hover:scale-[1.01]">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Active Quiz Rooms</span>
                <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">3</Heading>
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1 animate-pulse">
                  Socket active
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-veda-indigo-500/10 flex items-center justify-center text-accent">
                <Users className="h-5 w-5" />
              </div>
            </Card>

            {/* Stat 4 */}
            <Card glass className="p-4 flex items-center justify-between border-l-4 border-l-muted hover:scale-[1.01]">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">AI Agent Credits</span>
                <Heading variant="h3" className="text-2xl font-bold leading-none tracking-tight">4.8K</Heading>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  Renews in 5d
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
            </Card>
          </Grid>
        </div>

        {/* --- MAIN SPLIT PANEL (RECENT LISTINGS VS SHORTCUTS) --- */}
        <Grid cols={1} lgCols={3} gap={6} className="items-start">
          {/* Recent Assessments list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Assessments
                </span>
              </div>
              <Link href="/history" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
                See all history <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <StaggerContainer className="space-y-3">
              {recentAssessments.map((assessment) => {
                const diffBadges = {
                  beginner: "success" as const,
                  intermediate: "info" as const,
                  expert: "warning" as const,
                };

                return (
                  <StaggerChild key={assessment.id}>
                    <Card glass hover className="border border-border/40 shadow-sm hover:shadow-glow transition-all duration-300">
                      <CardHeader className="p-5 pb-2 flex-row justify-between items-start space-y-0 gap-3">
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-sm font-semibold truncate leading-none">
                            {assessment.title}
                          </CardTitle>
                          <CardDescription className="text-xs truncate max-w-md">
                            {assessment.description}
                          </CardDescription>
                        </div>
                        <Badge variant={diffBadges[assessment.difficulty as keyof typeof diffBadges]} className="text-[9px] uppercase tracking-wider px-2 py-0.5">
                          {assessment.difficulty}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 pb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-medium border-b border-border/10">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 opacity-70 text-primary shrink-0" />
                          {assessment.questions} Questions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 opacity-70 text-accent shrink-0" />
                          {assessment.submissions} submissions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 opacity-70 text-muted-foreground shrink-0" />
                          {assessment.created}
                        </span>
                      </CardContent>
                      <CardFooter className="p-4 justify-between items-center text-xs mt-auto bg-muted/10 h-12 rounded-b-xl">
                        <span className="text-[11px] text-muted-foreground">
                          Avg Grade: <strong className="text-foreground">{assessment.averageScore}</strong>
                        </span>
                        <Link href={`/preview/${assessment.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-1">
                            Review <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </StaggerChild>
                );
              })}
            </StaggerContainer>
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
