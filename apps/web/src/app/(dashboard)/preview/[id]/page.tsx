"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid } from "@/components/layout/grid";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerChild } from "@/components/ui/motion";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/lib/socket";
import { 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  Sparkles,
  Share2,
  Copy,
  Printer,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssessmentPreviewPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { socket } = useSocket();

  const [assessment, setAssessment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Expanded Answers State Map
  const [expandedAnswers, setExpandedAnswers] = React.useState<Record<string, boolean>>({});
  // Selected Radio Options Map
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});

  // Real-time background compilation states
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [currentStatus, setCurrentStatus] = React.useState("Initializing AI engine...");
  const [generationFailed, setGenerationFailed] = React.useState(false);
  const [errorDetail, setErrorDetail] = React.useState<string | null>(null);

  const fetchAssessment = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/assessments/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load: ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch assessment detail");
      }
      setAssessment(data.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  // Setup WebSocket subscription if assessment is still in draft state
  React.useEffect(() => {
    if (!socket || !assessment || assessment.status !== 'draft') return;

    const jobId = `job_${assessment._id}`;

    // Subscribe to room
    socket.emit('generation:subscribe' as any, { jobId });

    const handleProgress = (data: { jobId: string; progress: number; phase: string; status: string }) => {
      if (data.jobId === jobId) {
        setGenerationProgress(data.progress);
        setCurrentStatus(data.phase);
      }
    };

    const handleCompleted = (data: { jobId: string; assessmentId: string }) => {
      if (data.jobId === jobId) {
        toast({
          title: "AI Generation Completed!",
          description: "Assessment has been compiled and is ready for preview.",
          variant: "success" as any,
        });
        fetchAssessment();
      }
    };

    const handleFailed = (data: { jobId: string; error: string }) => {
      if (data.jobId === jobId) {
        setGenerationFailed(true);
        setErrorDetail(data.error);
        toast({
          title: "AI Generation Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    };

    socket.on('generation:progress' as any, handleProgress);
    socket.on('generation:completed' as any, handleCompleted);
    socket.on('generation:failed' as any, handleFailed);

    return () => {
      socket.emit('generation:unsubscribe' as any, { jobId });
      socket.off('generation:progress' as any, handleProgress);
      socket.off('generation:completed' as any, handleCompleted);
      socket.off('generation:failed' as any, handleFailed);
    };
  }, [socket, assessment, fetchAssessment, toast]);

  const handleOptionSelect = (qId: string, optId: string) => {
    setSelectedOptions(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleAnswer = (qId: string) => {
    setExpandedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Assessment preview link copied to clipboard.",
      variant: "success" as any,
    });
  };

  const handleCopyMarkdown = () => {
    if (!assessment) return;
    let markdown = `# VEDA AI ACADEMIC ASSESSMENT SHEET\n\n`;
    markdown += `**Title:** ${assessment.title}\n`;
    markdown += `**Subject:** ${assessment.subject}\n`;
    markdown += `**Grade Level:** ${assessment.classGrade}\n`;
    markdown += `**Total Marks:** ${assessment.marks} Pts\n`;
    markdown += `**Due Date:** ${new Date(assessment.dueDate).toLocaleDateString()}\n\n`;
    
    if (assessment.instructions) {
      markdown += `*Instructions: ${assessment.instructions}*\n\n`;
    }

    const paper = assessment.generatedPaper;
    if (paper && paper.questions && paper.questions.length > 0) {
      // Grouping questions for text copying
      const mcqs = paper.questions.filter((q: any) => q.type === 'mcq' || q.type === 'multiple-choice');
      const shortAnswers = paper.questions.filter((q: any) => q.type === 'short-answer');
      const codingChallenges = paper.questions.filter((q: any) => q.type === 'coding' || q.type === 'essay');

      if (mcqs.length > 0) {
        markdown += `## SECTION A: OBJECTIVE ASSESSMENT (Multiple-Choice Questions)\n\n`;
        mcqs.forEach((q: any, idx: number) => {
          markdown += `Q${idx + 1}. (${q.points} Pts) ${q.prompt}\n`;
          if (q.options) {
            q.options.forEach((opt: any) => {
              markdown += `- [ ] ${opt.text}\n`;
            });
          }
          markdown += `\n`;
        });
      }

      if (shortAnswers.length > 0) {
        markdown += `## SECTION B: SHORT-ANSWER CONCEPTUAL QUESTIONS\n\n`;
        shortAnswers.forEach((q: any, idx: number) => {
          markdown += `Q${idx + 1}. (${q.points} Pts) ${q.prompt}\n\n`;
        });
      }

      if (codingChallenges.length > 0) {
        markdown += `## SECTION C: ADVANCED DISCIPLINE / PRACTICAL CHALLENGES\n\n`;
        codingChallenges.forEach((q: any, idx: number) => {
          markdown += `Q${idx + 1}. (${q.points} Pts) ${q.prompt}\n\n`;
        });
      }
    } else {
      markdown += `*(No compiled assessment questions found. Ensure generation finished successfully.)*\n`;
    }

    navigator.clipboard.writeText(markdown);
    toast({
      title: "Markdown Copied!",
      description: "Exam paper content copied to clipboard in standard Markdown.",
      variant: "success" as any,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (typeof window === 'undefined') return;
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/assessments/${id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setGenerationFailed(false);
      setErrorDetail(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/assessments/${id}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Could not re-schedule AI background processes.");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast({
        title: "Regeneration Triggered!",
        description: "Veda AI background generation worker re-started.",
        variant: "success" as any,
      });

      setAssessment(data.data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      toast({
        title: "Regeneration Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Helper for matching badge colors
  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'easy' || d === 'beginner') return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (d === 'medium' || d === 'intermediate') return "bg-primary/10 text-primary border-primary/20";
    if (d === 'hard') return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20"; // Expert
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="text-xs font-mono text-muted-foreground mt-4">Retrieving Assessment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="max-w-md py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <Heading variant="h3" className="font-bold">Failed to Load Assessment</Heading>
        <Text className="text-sm text-muted-foreground">{error}</Text>
        <Button variant="outline" size="sm" onClick={fetchAssessment} className="rounded-xl mt-4">
          <RotateCcw className="h-4 w-4 mr-1" /> Retry
        </Button>
      </Container>
    );
  }

  // --- RENDERS BACKGROUND GENERATION SCREEN IF STATUS IS DRAFT ---
  if (assessment && assessment.status === 'draft') {
    return (
      <Section size="sm" className="flex-1 flex flex-col pt-20 relative">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-veda-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-veda-indigo-500/10 blur-[100px]" />

        <Container className="max-w-md w-full text-center space-y-8 relative z-10 mx-auto">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 blur-xl opacity-30 animate-pulse" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white shadow-glow mx-auto animate-bounce duration-1000">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <Heading variant="h3" className="text-2xl font-bold tracking-tight">
              {generationFailed ? "AI Compilation Interrupted" : "Formulating Assignment Paper"}
            </Heading>
            <div className="h-8 flex items-center justify-center">
              <Text className="text-xs font-mono text-muted-foreground tracking-wide">
                {generationFailed ? errorDetail : (currentStatus || "Structuring cognitive layers...")}
              </Text>
            </div>
          </div>

          {generationFailed ? (
            <div className="space-y-4">
              <Button 
                onClick={handleRegenerate}
                variant="gradient"
                size="sm"
                className="rounded-xl px-5 py-5 font-bold flex items-center gap-1.5 text-xs shadow-md mx-auto"
              >
                <RotateCcw className="h-4 w-4" /> Restart Generation
              </Button>
              <Link href="/dashboard" className="text-xs font-semibold text-primary block hover:underline">
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500 transition-all duration-300" 
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>PHASE {generationProgress < 25 ? "1" : generationProgress < 50 ? "2" : generationProgress < 75 ? "3" : generationProgress < 100 ? "4" : "5"} OF 5</span>
                <span>{generationProgress}% COMPLETE</span>
              </div>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  const paper = assessment?.generatedPaper;
  const questionsList = paper?.questions || [];

  // Group questions by formats
  const mcqQuestions = questionsList.filter((q: any) => q.type === 'mcq' || q.type === 'multiple-choice');
  const shortAnswerQuestions = questionsList.filter((q: any) => q.type === 'short-answer');
  const codingQuestions = questionsList.filter((q: any) => q.type === 'coding' || q.type === 'essay');

  return (
    <Section size="sm" className="flex-1 flex flex-col pt-6 relative pb-28">
      {/* Dynamic inline styles for premium printed sheets */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html, main, div, section, article {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-card {
            background: white !important;
            border: 3px double black !important;
            padding: 24px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            color: black !important;
          }
        }
      `}} />

      <Container className="space-y-6 flex-1 flex flex-col max-w-5xl print-sheet">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium no-print">
          <Link href="/dashboard" className="hover:text-foreground flex items-center gap-0.5">
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/dashboard" className="hover:text-foreground">Assessments</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate">Preview Paper</span>
        </div>

        {/* Title toolbar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <Heading variant="h2" as="h1" className="text-2xl font-extrabold sm:text-3xl tracking-tight leading-none truncate max-w-2xl">
              {assessment.title}
            </Heading>
            <Text className="text-muted-foreground text-sm mt-1">Review the generated quiz questionnaire, inspect cognitive parameters, and trigger print sheets.</Text>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-full shadow-sm">
              <Printer className="h-4 w-4 mr-1.5" /> Print/Export PDF
            </Button>
          </div>
        </div>

        {/* --- MAIN PREVIEW BODY DISPLAY --- */}
        <Grid cols={1} lgCols={3} gap={6} className="items-start flex-1 print-sheet">
          {/* Main Quiz Sheet Column */}
          <div className="lg:col-span-2 space-y-6 print-sheet">
            <Card glass className="p-0 overflow-hidden border border-border/40 shadow-xl rounded-2xl print-card">
              {/* --- ACADEMIC STYLED BANNER BANNER --- */}
              <div className="bg-zinc-950 text-white p-6 relative overflow-hidden border-b border-zinc-800 no-print">
                <div className="absolute top-[-45%] right-[-10%] w-60 h-60 rounded-full bg-veda-purple-500/20 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-[-45%] left-[20%] w-48 h-48 rounded-full bg-veda-indigo-500/20 blur-[50px] pointer-events-none" />
                
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Veda AI Compiled
                    </span>
                    <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Auto-Grader Bound
                    </span>
                  </div>
                  <Heading variant="h3" className="text-xl font-bold text-white tracking-tight">{assessment.title}</Heading>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400 font-medium pt-1">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary shrink-0" /> Due Date: {new Date(assessment.dueDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-accent shrink-0" /> {questionsList.length} Questions Formulated</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8 bg-card/5 print-sheet">
                {/* --- CLASSIC EXAM PAPER STUDENT HEADER --- */}
                <div className="border-[3px] border-double border-zinc-950 dark:border-zinc-800 p-6 rounded-xl text-center space-y-4 shadow-sm bg-background/50">
                  <div className="font-extrabold tracking-widest text-base sm:text-lg uppercase font-serif text-foreground">VEDA ACADEMIC ASSESSMENT SHEET</div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono font-bold text-left border-t border-dashed border-zinc-300 dark:border-zinc-800 pt-4 text-muted-foreground">
                    <div>CLASS/GRADE: <span className="text-foreground">{assessment.classGrade}</span></div>
                    <div>SUBJECT: <span className="text-foreground">{assessment.subject}</span></div>
                    <div>MAX MARKS: <span className="text-primary font-extrabold">{assessment.marks} Pts</span></div>
                    <div>DATE: <span className="text-foreground">{new Date(assessment.dueDate).toLocaleDateString()}</span></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono font-bold text-left border-t border-zinc-200 dark:border-zinc-800 pt-3 text-muted-foreground">
                    <div className="flex items-center gap-1">STUDENT NAME: <span className="border-b border-zinc-400 grow h-4 text-zinc-500 font-normal pl-2 font-sans select-none">___________________________</span></div>
                    <div className="flex items-center gap-1">ROLL NO / ID: <span className="border-b border-zinc-400 grow h-4 text-zinc-500 font-normal pl-2 font-sans select-none">_________________</span></div>
                  </div>
                </div>

                {assessment.instructions && (
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-muted/5 text-xs text-muted-foreground leading-relaxed leading-6">
                    <span className="font-bold text-foreground block mb-1">GENERAL INSTRUCTIONS:</span>
                    {assessment.instructions}
                  </div>
                )}

                {/* --- SECTION A: MCQ --- */}
                {mcqQuestions.length > 0 && (
                  <div className="space-y-5">
                    <div className="border-b-2 border-zinc-950 dark:border-zinc-800 pb-1.5 mt-2">
                      <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-foreground">SECTION A: OBJECTIVE ASSESSMENT</h2>
                      <span className="text-[10px] text-muted-foreground italic">Instruction: Answer all questions in this section. Select the correct options. Each question carries designated points.</span>
                    </div>

                    <StaggerContainer className="space-y-4">
                      {mcqQuestions.map((q: any, idx: number) => {
                        const isAnswerRevealed = !!expandedAnswers[q._id];
                        const userSelOption = selectedOptions[q._id];
                        return (
                          <StaggerChild key={q._id} className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/10 relative hover:border-primary/20 transition-colors duration-200 print:border-zinc-200">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-xs font-bold font-mono text-primary bg-primary/10 h-6 px-2.5 flex items-center justify-center rounded-lg">Q{idx + 1}</span>
                              
                              <div className="flex items-center gap-1.5 no-print shrink-0">
                                <span className={cn("text-[9px] font-bold border px-2 py-0.5 rounded-full shrink-0 uppercase", getDifficultyColor(q.difficulty))}>
                                  {q.difficulty}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full shrink-0">
                                  {q.points || 1} Pts
                                </span>
                              </div>
                              <span className="text-xs font-bold text-foreground font-serif print:block hidden shrink-0 pr-1">({q.points || 1} Pts)</span>
                            </div>
                            
                            <Text className="text-xs sm:text-sm font-semibold mt-1 text-foreground leading-snug">
                              {q.prompt}
                            </Text>

                            {/* Selectable radio options grid */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 print:grid-cols-2">
                                {q.options.map((opt: any) => {
                                  const isSelected = userSelOption === opt.id;
                                  return (
                                    <div
                                      key={opt.id}
                                      onClick={() => handleOptionSelect(q._id, opt.id)}
                                      className={cn(
                                        "p-2.5 rounded-xl border text-[11px] sm:text-xs cursor-pointer transition-all duration-150 select-none flex items-center gap-2.5",
                                        isSelected
                                          ? "bg-primary/5 border-primary text-foreground shadow-sm font-medium"
                                          : "border-border hover:bg-muted/20 text-muted-foreground/90 print:border-zinc-200"
                                      )}
                                    >
                                      <div className={cn(
                                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                        isSelected 
                                          ? "border-primary bg-primary/10" 
                                          : "border-muted-foreground/30 bg-background"
                                      )}>
                                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                      </div>
                                      <span className="leading-snug">{opt.text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Answer revealed toggle Accordion */}
                            <div className="pt-1.5 no-print">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAnswer(q._id)}
                                className="text-[10px] px-2 h-7 text-primary hover:bg-primary/10 font-bold flex items-center gap-1"
                              >
                                <HelpCircle className="h-3.5 w-3.5" /> 
                                {isAnswerRevealed ? "Hide guidelines" : "Reveal correct answer & guidelines"}
                                {isAnswerRevealed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              {isAnswerRevealed && (
                                <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in duration-200 shadow-inner">
                                  <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Correct Option: {q.correctAnswer?.toUpperCase() || 'A'}
                                  </span>
                                  {q.explanation && (
                                    <p className="font-normal leading-relaxed text-muted-foreground mt-0.5">
                                      {q.explanation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </StaggerChild>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                )}

                {/* --- SECTION B: SHORT ANSWERS --- */}
                {shortAnswerQuestions.length > 0 && (
                  <div className="space-y-5">
                    <div className="border-b-2 border-zinc-950 dark:border-zinc-800 pb-1.5 mt-2">
                      <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-foreground">SECTION B: SHORT-ANSWER ASSESSMENT</h2>
                      <span className="text-[10px] text-muted-foreground italic">Instruction: Formulate comprehensive answers for the following prompts. Focus on clarity and concept parameters.</span>
                    </div>

                    <StaggerContainer className="space-y-4">
                      {shortAnswerQuestions.map((q: any, idx: number) => {
                        const isAnswerRevealed = !!expandedAnswers[q._id];
                        return (
                          <StaggerChild key={q._id} className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/10 relative hover:border-accent/20 transition-colors duration-200 print:border-zinc-200">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-xs font-bold font-mono text-accent bg-accent/10 h-6 px-2.5 flex items-center justify-center rounded-lg">Q{idx + 1}</span>
                              
                              <div className="flex items-center gap-1.5 no-print shrink-0">
                                <span className={cn("text-[9px] font-bold border px-2 py-0.5 rounded-full shrink-0 uppercase", getDifficultyColor(q.difficulty))}>
                                  {q.difficulty}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full shrink-0">
                                  {q.points || 5} Pts
                                </span>
                              </div>
                              <span className="text-xs font-bold text-foreground font-serif print:block hidden shrink-0 pr-1">({q.points || 5} Pts)</span>
                            </div>
                            
                            <Text className="text-xs sm:text-sm font-semibold mt-1 text-foreground leading-snug">
                              {q.prompt}
                            </Text>

                            {/* Blank handwriting lines for printable layouts */}
                            <div className="h-20 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-background/30 flex flex-col justify-evenly px-4 py-2 select-none print:h-24 mt-3">
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1" />
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1" />
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1 print:block hidden" />
                            </div>

                            {/* Correct guidelines Toggle Accordion */}
                            <div className="pt-1.5 no-print">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAnswer(q._id)}
                                className="text-[10px] px-2 h-7 text-primary hover:bg-primary/10 font-bold flex items-center gap-1"
                              >
                                <HelpCircle className="h-3.5 w-3.5" /> 
                                {isAnswerRevealed ? "Hide guidelines" : "Reveal correct guidelines"}
                                {isAnswerRevealed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              {isAnswerRevealed && (
                                <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in duration-200 shadow-inner">
                                  <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Answer Guidelines:
                                  </span>
                                  <p className="font-normal leading-relaxed text-muted-foreground mt-0.5">
                                    {q.explanation || "Provide clear bullet points detailing logic steps, correct vocabulary references, and conceptual support details."}
                                  </p>
                                </div>
                              )}
                            </div>
                          </StaggerChild>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                )}

                {/* --- SECTION C: CODING / DISCIPLINE --- */}
                {codingQuestions.length > 0 && (
                  <div className="space-y-5">
                    <div className="border-b-2 border-zinc-950 dark:border-zinc-800 pb-1.5 mt-2">
                      <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-foreground">SECTION C: DISCIPLINE PRACTICALS & CODING</h2>
                      <span className="text-[10px] text-muted-foreground italic">Instruction: Formulate complete program codes, code snippets, or structured detailed essays. Focus on algorithm complexity.</span>
                    </div>

                    <StaggerContainer className="space-y-4">
                      {codingQuestions.map((q: any, idx: number) => {
                        const isAnswerRevealed = !!expandedAnswers[q._id];
                        return (
                          <StaggerChild key={q._id} className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/10 relative hover:border-emerald-200/20 transition-colors duration-200 print:border-zinc-200">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-xs font-bold font-mono text-emerald-500 bg-emerald-500/10 h-6 px-2.5 flex items-center justify-center rounded-lg">Q{idx + 1}</span>
                              
                              <div className="flex items-center gap-1.5 no-print shrink-0">
                                <span className={cn("text-[9px] font-bold border px-2 py-0.5 rounded-full shrink-0 uppercase", getDifficultyColor(q.difficulty))}>
                                  {q.difficulty}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full shrink-0">
                                  {q.points || 10} Pts
                                </span>
                              </div>
                              <span className="text-xs font-bold text-foreground font-serif print:block hidden shrink-0 pr-1">({q.points || 10} Pts)</span>
                            </div>
                            
                            <Text className="text-xs sm:text-sm font-semibold mt-1 text-foreground leading-snug">
                              {q.prompt}
                            </Text>

                            {/* Dark code editor mockup console for high-fidelity looks */}
                            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden text-xs text-zinc-300 font-mono shadow-md no-print select-none">
                              <div className="h-8 bg-zinc-900 px-3 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex gap-1">
                                    <span className="h-2 w-2 rounded-full bg-red-500/70" />
                                    <span className="h-2 w-2 rounded-full bg-amber-500/70" />
                                    <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                                  </div>
                                  <span className="text-[9px] text-zinc-500 pl-1 font-bold font-mono">console.js</span>
                                </div>
                              </div>
                              <div className="p-4 space-y-1.5 text-[10px] text-zinc-400">
                                <div><span className="text-zinc-700 select-none mr-2">1</span><span className="text-violet-400 font-semibold">function</span> <span className="text-sky-400 font-bold">solution</span>() &#123;</div>
                                <div><span className="text-zinc-700 select-none mr-2">2</span>  <span className="text-zinc-600 italic">// Write your comprehensive answer below</span></div>
                                <div><span className="text-zinc-700 select-none mr-2">3</span></div>
                                <div><span className="text-zinc-700 select-none mr-2">4</span>&#125;</div>
                              </div>
                            </div>

                            {/* Blank handwriting sheet lines for printable sheets */}
                            <div className="h-32 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-background/30 flex flex-col justify-evenly px-4 py-2 select-none print:block hidden">
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1 mt-2" />
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1 mt-6" />
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1 mt-6" />
                              <div className="border-b border-zinc-200 dark:border-zinc-800/80 w-full h-1 mt-6" />
                            </div>

                            {/* Answers revealed guidelines toggle Accordion */}
                            <div className="pt-1.5 no-print">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAnswer(q._id)}
                                className="text-[10px] px-2 h-7 text-primary hover:bg-primary/10 font-bold flex items-center gap-1"
                              >
                                <HelpCircle className="h-3.5 w-3.5" /> 
                                {isAnswerRevealed ? "Hide guidelines" : "Reveal correct logic guidelines"}
                                {isAnswerRevealed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              {isAnswerRevealed && (
                                <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in duration-200 shadow-inner">
                                  <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Scoring Guidelines:
                                  </span>
                                  <p className="font-normal leading-relaxed text-muted-foreground mt-0.5">
                                    {q.explanation || "Ensure correct algorithmic constructs, optimal time complex indices, variable boundaries, and rich documentation definitions."}
                                  </p>
                                </div>
                              )}
                            </div>
                          </StaggerChild>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right specifications column */}
          <div className="space-y-6 no-print">
            <Card glass className="border border-border/40 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-5 w-5 text-primary" /> Cognitive Specs
                </CardTitle>
                <CardDescription className="text-xs">Generated assessment profiles and limits compiled by Veda AI models.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Subject Domain</span>
                  <span className="font-semibold text-foreground text-right">{assessment.subject}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Class Target</span>
                  <span className="font-semibold text-foreground text-right">{assessment.classGrade}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Difficulty Spread</span>
                  <div className="text-right space-y-0.5">
                    <div className="font-semibold text-emerald-500">Beginners: {assessment.difficulty?.beginner || 30}%</div>
                    <div className="font-semibold text-primary font-bold">Intermediate: {assessment.difficulty?.intermediate || 50}%</div>
                    <div className="font-semibold text-amber-500">Expert: {assessment.difficulty?.expert || 20}%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Creation Date</span>
                  <span className="font-semibold text-foreground">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Container>

      {/* --- STICKY FLOATING ACTION BAR CONTROLS --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xl w-[90%] z-40 bg-zinc-950/90 border border-zinc-800 text-white rounded-2xl shadow-glow-strong backdrop-blur-md px-6 py-4 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 no-print select-none">
        <div className="flex items-center gap-1 shrink-0">
          <Brain className="h-5 w-5 text-accent animate-pulse shrink-0" />
          <div className="hidden sm:block">
            <div className="text-[10px] font-bold text-zinc-400 leading-none">VEDA EDITOR</div>
            <div className="text-[9px] text-zinc-500 leading-none mt-0.5">AI Generation active</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 grow justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRegenerate}
            className="text-xs h-9 rounded-xl font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1 shrink-0" /> <span className="hidden sm:inline">Regenerate</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyMarkdown}
            className="text-xs h-9 rounded-xl font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300"
          >
            <Copy className="h-3.5 w-3.5 sm:mr-1 shrink-0" /> <span className="hidden sm:inline">Copy Text</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="text-xs h-9 rounded-xl font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300"
          >
            <Share2 className="h-3.5 w-3.5 sm:mr-1 shrink-0" /> <span className="hidden sm:inline">Share</span>
          </Button>

          <Button 
            variant="gradient" 
            size="sm" 
            onClick={handleDownloadPDF}
            className="text-xs h-9 rounded-xl font-bold shadow-md shrink-0 px-4"
          >
            <Printer className="h-3.5 w-3.5 sm:mr-1.5 shrink-0" /> <span className="hidden sm:inline">Download PDF Booklet</span><span className="sm:hidden inline">Download</span>
          </Button>
        </div>
      </div>
    </Section>
  );
}
