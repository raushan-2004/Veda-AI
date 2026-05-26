"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid } from "@/components/layout/grid";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { useToast } from "@/hooks/use-toast";
import { AssignmentFormSchema, type AssignmentFormData } from "@/lib/schemas/assignment-form.schema";
import { useAssignmentFormStore } from "@/store/assignment-form.store";
import { useGenerationStore } from "@/store/generation.store";
import { useSocket } from "@/lib/socket";
import { 
  Sparkles, 
  Settings, 
  Brain, 
  Check, 
  Code, 
  BookOpen, 
  ListTodo, 
  ChevronRight,
  ArrowLeft,
  Calendar,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    currentStep,
    formData,
    uploadProgress,
    fileName,
    fileSize,
    setStep,
    updateFormData,
    setUploadedFile,
    setUploadProgress,
    resetForm,
  } = useAssignmentFormStore();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    activeJobId,
    generationProgress,
    currentStatus,
    hasFailed,
    errorLogs,
    startGenerationJob,
    updateProgress,
    failGenerationJob,
    completeGenerationJob,
    resetGenerationStore,
  } = useGenerationStore();

  const { socket } = useSocket();

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(AssignmentFormSchema),
    defaultValues: {
      title: formData.title || "",
      subject: formData.subject || "",
      classGrade: formData.classGrade || "",
      dueDate: formData.dueDate || "",
      questionTypes: formData.questionTypes || ["mcq"],
      numberOfQuestions: formData.numberOfQuestions || 10,
      marks: formData.marks || 20,
      difficultyDistribution: formData.difficultyDistribution || {
        beginner: 30,
        intermediate: 50,
        expert: 20,
      },
      additionalInstructions: formData.additionalInstructions || "",
    },
    mode: "onChange",
  });

  const watchedFields = watch();

  // Proactive real-time auto-saving (serializes state to Zustand persistent store via clean form subscription)
  React.useEffect(() => {
    const subscription = watch((value) => {
      const { file, ...serializable } = value;
      updateFormData(serializable as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  // Synchronous, proportional difficulty balancing algorithm
  const handleDifficultyChange = (field: 'beginner' | 'intermediate' | 'expert', value: number) => {
    const current = watchedFields.difficultyDistribution || { beginner: 30, intermediate: 50, expert: 20 };
    const otherFields = (['beginner', 'intermediate', 'expert'] as const).filter(f => f !== field);
    const otherSum = current[otherFields[0]] + current[otherFields[1]];
    
    const newDistribution = { ...current, [field]: value };
    
    if (otherSum === 0) {
      newDistribution[otherFields[0]] = Math.round((100 - value) / 2);
      newDistribution[otherFields[1]] = 100 - value - newDistribution[otherFields[0]];
    } else {
      const factor = (100 - value) / otherSum;
      const val1 = Math.round(current[otherFields[0]] * factor);
      const val2 = 100 - value - val1;
      newDistribution[otherFields[0]] = val1;
      newDistribution[otherFields[1]] = val2;
    }
    
    setValue('difficultyDistribution', newDistribution, { shouldValidate: true });
  };

  // Drag and drop file upload event handling
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setValue('file', files, { shouldValidate: true });
      simulateFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setValue('file', files, { shouldValidate: true });
      simulateFileUpload(files[0]);
    }
  };

  const simulateFileUpload = (file: File) => {
    setUploadedFile(file.name, file.size);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const removeFile = () => {
    setValue('file', undefined);
    setUploadedFile(null, null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleType = (type: string) => {
    const currentTypes = watchedFields.questionTypes || [];
    if (currentTypes.includes(type)) {
      if (currentTypes.length > 1) {
        setValue('questionTypes', currentTypes.filter(t => t !== type), { shouldValidate: true });
      }
    } else {
      setValue('questionTypes', [...currentTypes, type], { shouldValidate: true });
    }
  };

  // Pagination navigation checks
  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let fieldsToValidate: Array<keyof AssignmentFormData> = [];
    if (currentStep === 0) {
      fieldsToValidate = ['title', 'subject', 'classGrade', 'dueDate'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['questionTypes', 'numberOfQuestions', 'marks', 'difficultyDistribution'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(currentStep + 1);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsGenerating(true);
      resetGenerationStore();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          subject: data.subject,
          classGrade: data.classGrade,
          dueDate: new Date(data.dueDate).toISOString(),
          numQuestions: data.numberOfQuestions,
          marks: data.marks,
          difficulty: {
            beginner: data.difficultyDistribution.beginner,
            intermediate: data.difficultyDistribution.intermediate,
            expert: data.difficultyDistribution.expert,
          },
          formats: data.questionTypes,
          instructions: data.additionalInstructions,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to initialize assessment generation');
      }

      const assessmentId = result.data._id;
      const jobId = `job_${assessmentId}`;

      // Start the job in store
      startGenerationJob(jobId);

      // Subscribe to the Socket room
      if (socket) {
        socket.emit('generation:subscribe' as any, { jobId });
      }
    } catch (error: any) {
      setIsGenerating(false);
      toast({
        title: "AI Generation Request Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Setup real-time Socket.IO listeners
  React.useEffect(() => {
    if (!socket || !activeJobId) return;

    const handleProgress = (data: { jobId: string; progress: number; phase: string; status: string }) => {
      if (data.jobId === activeJobId) {
        updateProgress(data.progress, data.phase);
      }
    };

    const handleCompleted = (data: { jobId: string; assessmentId: string; questionsCount: number }) => {
      if (data.jobId === activeJobId) {
        completeGenerationJob();
        toast({
          title: "Assignment Created!",
          description: `'${watchedFields.title}' assignment has been formulated successfully by Veda AI.`,
          variant: "success" as any,
        });
        resetForm();
        resetGenerationStore();
        setIsGenerating(false);
        router.push(`/preview/${data.assessmentId}`);
      }
    };

    const handleFailed = (data: { jobId: string; error: string }) => {
      if (data.jobId === activeJobId) {
        failGenerationJob(data.error);
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
      socket.off('generation:progress' as any, handleProgress);
      socket.off('generation:completed' as any, handleCompleted);
      socket.off('generation:failed' as any, handleFailed);
    };
  }, [socket, activeJobId, updateProgress, completeGenerationJob, failGenerationJob, resetGenerationStore, resetForm, router, watchedFields.title, watchedFields.subject, toast]);

  return (
    <Section size="sm" className="flex-1 flex flex-col pt-6 relative">
      {/* --- AI GENERATION OVERLAY LOADER --- */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-veda-purple-500/10 blur-[130px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-veda-indigo-500/10 blur-[130px]" />

          <div className="max-w-md w-full text-center space-y-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 blur-xl opacity-40 animate-pulse" />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white shadow-glow-strong mx-auto animate-bounce duration-1000">
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <Heading variant="h3" className="text-2xl font-bold text-white tracking-tight">
                {hasFailed ? "AI Generation Failed" : "Formulating Assignment Sheet"}
              </Heading>
              <div className="h-8 flex items-center justify-center">
                <Text className="text-xs font-mono text-zinc-300 tracking-wide">
                  {hasFailed ? errorLogs : (currentStatus || "Structuring topic paradigms...")}
                </Text>
              </div>
            </div>

            {hasFailed ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsGenerating(false);
                  resetGenerationStore();
                }}
                className="mt-4 border-zinc-700 hover:bg-zinc-800 text-white rounded-xl"
              >
                Close & Retry
              </Button>
            ) : (
              <div className="space-y-2.5">
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500 transition-all duration-500" 
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-accent animate-pulse" /> PHASE {generationProgress < 25 ? "1" : generationProgress < 50 ? "2" : generationProgress < 75 ? "3" : generationProgress < 100 ? "4" : "5"} OF 5</span>
                  <span>{generationProgress}% COMPLETE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Container className="space-y-6 flex-1 flex flex-col max-w-3xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">Create Assignment</span>
        </div>

        {/* Header & Steps Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <Heading variant="h2" as="h1" className="text-2xl font-extrabold tracking-tight leading-none">
              Create New Assignment
            </Heading>
            <Text className="text-muted-foreground text-xs sm:text-sm">Design visual assessments, structure scoring paradigms, and upload files.</Text>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-xl border border-border/40 self-start sm:self-auto text-xs font-bold text-muted-foreground select-none">
            {[
              { idx: 0, label: "1. Basics" },
              { idx: 1, label: "2. Schema" },
              { idx: 2, label: "3. Assets" }
            ].map((step) => {
              const isActive = currentStep === step.idx;
              const isPast = currentStep > step.idx;
              return (
                <span
                  key={step.idx}
                  onClick={() => {
                    if (isPast || isActive) {
                      setStep(step.idx);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors duration-150",
                    isActive ? "bg-background text-foreground shadow-sm" : "",
                    isPast ? "cursor-pointer hover:bg-background/40 hover:text-foreground text-muted-foreground/80" : "opacity-50"
                  )}
                >
                  {step.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Assignment Creation Form Content */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="space-y-6 flex-1 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* STEP 1: CORE PARAMETERS */}
            {currentStep === 0 && (
              <Card glass className="border border-border/40 shadow-lg">
                <CardHeader className="p-6">
                  <CardTitle className="text-base flex items-center gap-2 font-bold text-foreground">
                    <Settings className="h-5 w-5 text-primary" />
                    Assignment Parameters
                  </CardTitle>
                  <CardDescription className="text-xs">Setup core academic descriptors and deadlines.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Assignment Title</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. Midterm JavaScript Algorithms, Grade 9 Algebra..." 
                      className="focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all duration-200"
                      {...register('title')}
                    />
                    {errors.title && (
                      <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.title.message}
                      </span>
                    )}
                  </div>

                  {/* Subject and Grade Grid */}
                  <Grid cols={1} smCols={2} gap={4}>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Subject / Topic</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Mathematics, computer Science" 
                        className="focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all"
                        {...register('subject')}
                      />
                      {errors.subject && (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.subject.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Class / Grade Level</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Grade 10-A, Junior Web Devs" 
                        className="focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all"
                        {...register('classGrade')}
                      />
                      {errors.classGrade && (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.classGrade.message}
                        </span>
                      )}
                    </div>
                  </Grid>

                  {/* Due Date Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Due Date Picker
                    </label>
                    <Input 
                      type="date" 
                      className="focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all w-full select-none"
                      {...register('dueDate')}
                    />
                    {errors.dueDate && (
                      <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.dueDate.message}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: SCHEMA CONFIGURATIONS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Question Formats Checkbox Grid */}
                <Card glass className="border border-border/40 shadow-lg">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base flex items-center gap-2 font-bold text-foreground">
                      <ListTodo className="h-5 w-5 text-accent" />
                      Question Formats
                    </CardTitle>
                    <CardDescription className="text-xs">Specify question types included in the assignment sheets.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'mcq', label: 'Multiple Choice (MCQ)', icon: BookOpen, color: 'text-primary' },
                        { id: 'coding', label: 'Coding Challenge', icon: Code, color: 'text-accent' },
                        { id: 'short-answer', label: 'Short Answers', icon: ListTodo, color: 'text-emerald-500' }
                      ].map((type) => {
                        const isSelected = (watchedFields.questionTypes || []).includes(type.id);
                        const Icon = type.icon;
                        return (
                          <div 
                            key={type.id}
                            onClick={() => toggleType(type.id)}
                            className={cn(
                              "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 select-none",
                              isSelected
                                ? "bg-muted/30 border-primary text-foreground shadow-sm font-semibold"
                                : "bg-card/40 border-border hover:bg-muted/20 text-muted-foreground"
                            )}
                          >
                            <span className="flex items-center gap-2 text-xs">
                              <Icon className={cn("h-4.5 w-4.5 shrink-0", type.color)} /> {type.label}
                            </span>
                            <div className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background"
                            )}>
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.questionTypes && (
                      <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.questionTypes.message}
                      </span>
                    )}
                  </CardContent>
                </Card>

                {/* Counts and Marks Row */}
                <Grid cols={1} smCols={2} gap={4}>
                  <Card glass className="border border-border/40 shadow-lg">
                    <CardHeader className="p-5">
                      <CardTitle className="text-base font-bold">Total Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold font-mono">
                        <span className="text-muted-foreground">COUNT RANGE:</span>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">{watchedFields.numberOfQuestions || 10}</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="50"
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={watchedFields.numberOfQuestions || 10}
                        onChange={(e) => setValue('numberOfQuestions', parseInt(e.target.value), { shouldValidate: true })}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Min: 5</span>
                        <span>Max: 50</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card glass className="border border-border/40 shadow-lg">
                    <CardHeader className="p-5">
                      <CardTitle className="text-base font-bold">Total Marks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Scoring Weight (Pts)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 50, 100" 
                        className="focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all font-mono font-bold"
                        value={watchedFields.marks || 20}
                        onChange={(e) => setValue('marks', parseInt(e.target.value) || 0, { shouldValidate: true })}
                      />
                      {errors.marks && (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.marks.message}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Difficulty range distribution sliders */}
                <Card glass className="border border-border/40 shadow-lg">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base font-bold">Difficulty Distribution</CardTitle>
                    <CardDescription className="text-xs">Adjust percentages to exactly equal 100% total weight.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-5">
                    {/* Balanced Total indicator */}
                    {errors.difficultyDistribution?.beginner && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2 animate-pulse">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" /> {(errors.difficultyDistribution?.beginner as any)?.message}
                      </div>
                    )}
                    
                    {/* Total balance meter */}
                    <div className="bg-muted/20 p-4 rounded-xl border border-border/40 flex justify-between items-center text-xs font-bold font-mono select-none">
                      <span className="text-muted-foreground">TOTAL ALLOCATION SUM:</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-white shadow-sm font-extrabold",
                        ((watchedFields.difficultyDistribution?.beginner || 0) + 
                         (watchedFields.difficultyDistribution?.intermediate || 0) + 
                         (watchedFields.difficultyDistribution?.expert || 0)) === 100
                          ? "bg-emerald-500" 
                          : "bg-destructive animate-pulse"
                      )}>
                        {(watchedFields.difficultyDistribution?.beginner || 0) + 
                         (watchedFields.difficultyDistribution?.intermediate || 0) + 
                         (watchedFields.difficultyDistribution?.expert || 0)}%
                      </span>
                    </div>

                    {/* Beginners */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Beginner Weight</span>
                        <span className="font-mono font-bold text-foreground">{watchedFields.difficultyDistribution?.beginner || 30}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={watchedFields.difficultyDistribution?.beginner || 30}
                        onChange={(e) => handleDifficultyChange('beginner', parseInt(e.target.value))}
                      />
                    </div>

                    {/* Intermediate */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Intermediate Weight</span>
                        <span className="font-mono font-bold text-foreground">{watchedFields.difficultyDistribution?.intermediate || 50}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={watchedFields.difficultyDistribution?.intermediate || 50}
                        onChange={(e) => handleDifficultyChange('intermediate', parseInt(e.target.value))}
                      />
                    </div>

                    {/* Expert */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Expert Weight</span>
                        <span className="font-mono font-bold text-foreground">{watchedFields.difficultyDistribution?.expert || 20}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
                        value={watchedFields.difficultyDistribution?.expert || 20}
                        onChange={(e) => handleDifficultyChange('expert', parseInt(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 3: REFERENCE ASSETS & RULES */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* File Upload drag area */}
                <Card glass className="border border-border/40 shadow-lg">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base flex items-center gap-2 font-bold text-foreground">
                      <UploadCloud className="h-5 w-5 text-primary" />
                      Reference Materials Upload
                    </CardTitle>
                    <CardDescription className="text-xs">Submit guidelines, syllabi, or mock sheets (Max 5MB).</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-border/60 hover:border-primary/50 bg-muted/5 hover:bg-muted/10 rounded-2xl cursor-pointer text-center space-y-3 transition-colors select-none"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,.txt,.md,.docx"
                        onChange={handleFileSelect}
                      />
                      <UploadCloud className="h-10 w-10 text-muted-foreground/60 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <Text className="text-xs font-semibold text-foreground">Drag and drop file here, or click to browse</Text>
                        <Text className="text-[10px] text-muted-foreground">Supported extensions: PDF, TXT, MD, DOCX (Max 5MB)</Text>
                      </div>
                    </div>

                    {errors.file && (
                      <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {(errors.file?.message as any)}
                      </span>
                    )}

                    {/* Progress tracking sheet */}
                    {fileName && (
                      <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3 shadow-inner">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                            <span className="font-semibold truncate text-foreground text-[11px]">{fileName}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">({Math.round((fileSize || 0) / 1024)} KB)</span>
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={removeFile}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        {/* Progress slider bar */}
                        {uploadProgress < 100 ? (
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                              <span>UPLOADING REFERENCES...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold font-mono">
                            <Check className="h-4 w-4 stroke-[3]" /> UPLOAD COMPLETE & SECURED
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional instructions */}
                <Card glass className="border border-border/40 shadow-lg">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base font-bold text-foreground">Additional Instructions</CardTitle>
                    <CardDescription className="text-xs">Provide special guidelines, coding rules, or exam terms.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <textarea 
                      placeholder="e.g. Write clean ES6 code; focus on virtual DOM concepts; no external library helpers allowed..." 
                      className="w-full h-28 rounded-xl border border-input p-3.5 text-xs bg-card/10 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all duration-200 resize-none leading-relaxed text-foreground"
                      {...register('additionalInstructions')}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Navigation Controls Toolbar */}
          <div className="flex justify-between items-center gap-3 pt-6 border-t border-border/20 mt-6 select-none">
            {/* Draft saved tag indicator */}
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> DRAFT AUTO-SAVED
            </span>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl px-4 py-5 font-bold flex items-center gap-1 text-xs"
                  onClick={() => setStep(currentStep - 1)}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}

              {currentStep < 2 ? (
                <Button 
                  key="next-btn"
                  type="button" 
                  variant="gradient" 
                  size="sm" 
                  className="rounded-xl px-5 py-5 font-bold flex items-center gap-1 text-xs shadow-md"
                  onClick={handleNext}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  key="submit-btn"
                  type="submit" 
                  variant="gradient" 
                  size="sm" 
                  disabled={!isValid}
                  className="rounded-xl px-6 py-5 font-bold flex items-center gap-1.5 text-xs shadow-glow-strong disabled:opacity-50"
                >
                  <Sparkles className="h-4.5 w-4.5 mr-1 animate-pulse" /> Start AI Generation
                </Button>
              )}
            </div>
          </div>
        </form>
      </Container>
    </Section>
  );
}
