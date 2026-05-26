"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heading, Text, Code } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid } from "@/components/layout/grid";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerChild } from "@/components/ui/motion";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronRight, 
  FileText, 
  Play, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssessmentPreviewPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const [expandedAnswer, setExpandedAnswer] = React.useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<number, number>>({});

  // Parse path slug into readable title
  const formattedTitle = typeof id === "string"
    ? id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "AI Custom Assessment";

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [qIdx]: optIdx
    });
  };

  const handleExport = () => {
    toast({
      title: "PDF Export Complete",
      description: `'${formattedTitle}' assessment sheet has been compiled and saved.`,
      variant: "success" as any
    });
  };

  const handleSocketRoom = () => {
    toast({
      title: "WebSocket Sync Established",
      description: "Established live grading room 204. Candidates may now join.",
      variant: "success" as any
    });
  };

  return (
    <Section size="sm" className="flex-1 flex flex-col pt-6">
      <Container className="space-y-6 flex-1 flex flex-col max-w-5xl">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/history" className="hover:text-foreground">History</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate">Preview</span>
        </div>

        {/* Title toolbar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Heading variant="h2" as="h1" className="text-2xl font-extrabold sm:text-3xl tracking-tight leading-none truncate max-w-2xl">
              {formattedTitle}
            </Heading>
            <Text className="text-muted-foreground text-sm mt-1">Review the generated quiz questionnaire, inspect code parameters, and download sheet copies.</Text>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full shadow-sm">
              <FileText className="h-4 w-4 mr-1" /> Export PDF
            </Button>
            <Button variant="gradient" size="sm" onClick={handleSocketRoom} className="rounded-full shadow-md">
              <Play className="h-4 w-4 mr-1 animate-pulse" /> Launch Session
            </Button>
          </div>
        </div>

        {/* --- MAIN PREVIEW BODY DISPLAY --- */}
        <Grid cols={1} lgCols={3} gap={6} className="items-start flex-1">
          {/* Main Quiz Sheet Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card glass className="p-0 overflow-hidden border border-border/40 shadow-xl rounded-2xl">
              {/* --- PANEL 4 HIGH-CONTRAST DARK HEADER BANNER --- */}
              <div className="bg-zinc-950 text-white p-6 relative overflow-hidden border-b border-zinc-800">
                {/* Visual blur highlights */}
                <div className="absolute top-[-40%] right-[-10%] w-60 h-60 rounded-full bg-veda-purple-500/20 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-[-45%] left-[20%] w-48 h-48 rounded-full bg-veda-indigo-500/20 blur-[50px] pointer-events-none" />
                
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Veda AI Compiled
                    </span>
                    <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Intermediate Preset
                    </span>
                  </div>
                  <Heading variant="h3" className="text-xl font-bold text-white tracking-tight">{formattedTitle}</Heading>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400 font-medium pt-1">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary shrink-0" /> Time Limit: 30 Mins</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-accent shrink-0" /> 3 Questions Formulated</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><Sparkles className="h-4 w-4 shrink-0 animate-pulse" /> Auto-graded Core</span>
                  </div>
                </div>
              </div>

              {/* Quiz Questions List Container */}
              <StaggerContainer className="p-6 space-y-6 bg-card/10">
                {/* Question 1: Multiple choice */}
                <StaggerChild className="space-y-4 p-5 rounded-xl border border-border/40 bg-muted/15 relative hover:border-primary/25 transition-colors duration-250">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-bold font-mono text-primary bg-primary/10 h-6 w-10 flex items-center justify-center rounded-lg">Q1</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Multiple Choice (5 pts)</span>
                  </div>
                  
                  <Text className="text-sm font-semibold mt-1 text-foreground leading-snug">
                    Which of the following describes the key structural difference between React Server Components (RSC) and standard Client Components?
                  </Text>
                  
                  {/* Selectable Options grid */}
                  <div className="space-y-2.5 mt-4">
                    {[
                      "RSCs can maintain active browser states and hook listeners directly.",
                      "RSCs compile and render exclusively on the server, sending zero JS to the client.",
                      "Client components cannot nest server components inside their render logs.",
                      "RSCs require full client-side hydrations before DOM mounting triggers."
                    ].map((opt, optIdx) => {
                      const isSelected = selectedOptions[0] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(0, optIdx)}
                          className={cn(
                            "p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 select-none flex items-center gap-3",
                            isSelected
                              ? "bg-primary/5 border-primary text-foreground shadow-sm font-medium"
                              : "border-border hover:bg-muted/30 text-muted-foreground/90"
                          )}
                        >
                          {/* PANEL 4 CUSTOM CIRCULAR RADIO BUTTON */}
                          <div className={cn(
                            "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                            isSelected 
                              ? "border-primary bg-primary/10 shadow-[0_0_8px_rgba(168,85,247,0.3)]" 
                              : "border-muted-foreground/30 bg-background"
                          )}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Accordion Answers reveal */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedAnswer(expandedAnswer === 0 ? null : 0)}
                      className="text-xs px-2 h-8 text-primary hover:bg-primary/10 font-bold flex items-center gap-1.5"
                    >
                      <HelpCircle className="h-4 w-4" /> 
                      {expandedAnswer === 0 ? "Hide guidelines" : "Reveal correct answer & AI grading guidelines"}
                      {expandedAnswer === 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    {expandedAnswer === 0 && (
                      <div className="mt-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in duration-200 shadow-inner">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" /> Correct Option: B
                        </span>
                        <p className="font-normal text-[11px] leading-relaxed mt-1 text-muted-foreground">
                          RSCs render only on the backend node server, returning structured JSON streams instead of bundles. This dramatically cuts down first-load client browser packages.
                        </p>
                      </div>
                    )}
                  </div>
                </StaggerChild>

                {/* Question 2: Coding panel */}
                <StaggerChild className="space-y-4 p-5 rounded-xl border border-border/40 bg-muted/15 hover:border-accent/25 transition-colors duration-250">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-bold font-mono text-accent bg-accent/10 h-6 w-10 flex items-center justify-center rounded-lg">Q2</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coding test (15 pts)</span>
                  </div>
                  
                  <Text className="text-sm font-semibold mt-1 text-foreground leading-snug">
                    Write a helper JavaScript function <Code>mergeSortedArrays(arr1, arr2)</Code> that takes two sorted numeric arrays and returns a single sorted array.
                  </Text>

                  {/* --- PANEL 4 HIGH-FIDELITY DARK CODE TERMINAL EDITOR --- */}
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden text-xs text-zinc-300 font-mono shadow-glow shadow-zinc-950/40">
                    {/* Console Header tab */}
                    <div className="h-10 bg-zinc-900 px-4 border-b border-zinc-800 flex items-center justify-between text-zinc-400 select-none">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 pl-2">mergeSortedArrays.js</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Executable Console</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Console Content lines with syntax highlights */}
                    <div className="p-5 space-y-1.5 select-none text-[11px] leading-relaxed text-zinc-300">
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">1</span> 
                        <span className="text-violet-400 font-semibold">function</span> <span className="text-sky-400 font-bold">mergeSortedArrays</span>(<span className="text-orange-300">arr1</span>, <span className="text-orange-300">arr2</span>) &#123;
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">2</span>   
                        <span className="text-zinc-500 italic">// Your executable AI code compiles here</span>
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">3</span>   
                        <span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">merged</span> = [];
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">4</span>   
                        <span className="text-violet-400 font-semibold">let</span> <span className="text-zinc-300">i</span> = <span className="text-emerald-400">0</span>, <span className="text-zinc-300">j</span> = <span className="text-emerald-400">0</span>;
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">5</span>   
                        <span className="text-zinc-500">...</span>
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">6</span>   
                        <span className="text-violet-400 font-semibold">return</span> <span className="text-sky-300">merged</span>;
                      </div>
                      <div>
                        <span className="inline-block w-6 text-zinc-600 text-right pr-2">7</span> &#125;
                      </div>
                    </div>
                  </div>
                </StaggerChild>
              </StaggerContainer>
            </Card>
          </div>

          {/* Right actions list */}
          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base">Testing Spec</CardTitle>
                <CardDescription>Assessment specifications drafted by Veda AI agent models.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Difficulty Rating</span>
                  <span className="font-semibold text-primary">Intermediate Applied</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Candidate Pool</span>
                  <span className="font-semibold">Frontend Developers</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Question Distribution</span>
                  <span className="font-semibold text-accent">2 MCQs, 1 Code Console</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">AI Token Usage</span>
                  <span className="font-semibold">184 Tokens</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
