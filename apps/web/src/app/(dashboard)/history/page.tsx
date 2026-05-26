"use client";

import * as React from "react";
import Link from "next/link";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { StaggerContainer, StaggerChild } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { useAssessmentStore } from "@/store";
import { 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  Trash2, 
  Eye, 
  ArrowLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  RefreshCw
} from "lucide-react";

interface ExtendedAssessment {
  _id: string;
  title: string;
  subject: string;
  classGrade: string;
  dueDate: string;
  description?: string;
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

const EmptyStateIllustration = () => (
  <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-2">
    <div className="absolute inset-0 bg-gradient-to-tr from-veda-purple-500/10 to-veda-indigo-500/10 rounded-full blur-2xl opacity-70" />
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-lg animate-pulse">
      <rect x="38" y="24" width="54" height="74" rx="8" className="fill-card stroke-border" strokeWidth="2.5" />
      <line x1="50" y1="42" x2="72" y2="42" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="52" x2="82" y2="52" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="62" x2="78" y2="62" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="72" x2="66" y2="72" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <circle cx="92" cy="24" r="13" fill="#EF4444" className="stroke-card" strokeWidth="2" />
      <path d="M87.5 19.5L96.5 28.5M96.5 19.5L87.5 28.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="88" r="17" className="fill-card stroke-primary" strokeWidth="3" />
      <line x1="60" y1="100" x2="74" y2="114" className="stroke-primary" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function HistoryPage() {
  const { toast } = useToast();
  const { 
    assessments, 
    isLoading, 
    fetchAssessmentsAsync, 
    removeAssessmentAsync, 
    retryAssessmentAsync 
  } = useAssessmentStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 6;

  React.useEffect(() => {
    fetchAssessmentsAsync().catch((err) => {
      console.error("Failed to load assessments:", err);
    });
  }, [fetchAssessmentsAsync]);

  const allAssessments = assessments as unknown as ExtendedAssessment[];

  // Filter listings (Memoized)
  const filteredAssessments = React.useMemo(() => {
    return allAssessments.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        
      const difficultyTag = item.tags?.[0] || "intermediate";
      const matchesDiff = difficultyFilter === "all" || difficultyTag === difficultyFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [allAssessments, searchQuery, difficultyFilter, statusFilter]);

  // Paginated listings (Memoized)
  const { totalPages, paginatedAssessments } = React.useMemo(() => {
    return {
      totalPages: Math.ceil(filteredAssessments.length / pageSize),
      paginatedAssessments: filteredAssessments.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    };
  }, [filteredAssessments, currentPage]);

  // Reset page on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, difficultyFilter, statusFilter]);

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
      <Container className="space-y-6 flex-1 flex flex-col">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">Assessment History</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <Heading variant="h2" as="h1" className="text-2xl font-extrabold sm:text-3xl tracking-tight leading-none">
              Assessment Catalog Logs
            </Heading>
            <Text className="text-muted-foreground text-sm mt-1">Review historical generated tests, inspect student metrics, and manage catalog databases.</Text>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-muted/20 border border-border/40 p-1 rounded-xl self-start sm:self-auto shrink-0 select-none">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 rounded-lg text-xs font-semibold px-3 gap-1.5"
            >
              <LayoutGrid className="h-4.5 w-4.5" /> Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 rounded-lg text-xs font-semibold px-3 gap-1.5"
            >
              <List className="h-4.5 w-4.5" /> Table
            </Button>
          </div>
        </div>

        {/* --- FILTER & QUERY SEARCH BAR --- */}
        <Card glass className="p-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search query */}
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground/60" />
              <Input
                type="text"
                placeholder="Search assessments by title, subject or tags..."
                className="pl-9 bg-background/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:block shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-background/30">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Ready (Published)</SelectItem>
                    <SelectItem value="draft">Compiling (Draft)</SelectItem>
                    <SelectItem value="failed">Failed Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background/30">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner Core</SelectItem>
                  <SelectItem value="intermediate">Intermediate Applied</SelectItem>
                  <SelectItem value="expert">Expert Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* --- DYNAMIC LOADING SKELETON STATES --- */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} glass className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card glass className="overflow-hidden border border-border/40">
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="flex gap-4 items-center justify-between border-b border-border/10 pb-3">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </Card>
          )
        ) : paginatedAssessments.length > 0 ? (
          <>
            {/* GRID LAYOUT VIEW */}
            {viewMode === "grid" && (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedAssessments.map((assessment) => {
                  const difficultyTag = assessment.tags?.[0] || "intermediate";
                  const diffColors = {
                    beginner: "success" as const,
                    intermediate: "info" as const,
                    expert: "warning" as const,
                  };

                  return (
                    <StaggerChild key={assessment._id}>
                      <Card glass hover className="h-full flex flex-col justify-between border border-border/40 shadow-sm hover:shadow-glow transition-all duration-300">
                        <CardHeader className="p-5 pb-2 flex-row justify-between items-start space-y-0 gap-3">
                          <div className="space-y-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate leading-none">
                              {assessment.title}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2 h-8 leading-snug">
                              {assessment.subject} • Grade {assessment.classGrade}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <Badge variant={diffColors[difficultyTag as keyof typeof diffColors]} className="text-[9px] uppercase tracking-wider px-2 py-0.5">
                              {difficultyTag}
                            </Badge>
                            {assessment.status === 'draft' && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] uppercase tracking-wider px-1.5 py-0.2 animate-pulse border-primary/20">
                                Compiling
                              </Badge>
                            )}
                            {assessment.status === 'failed' && (
                              <Badge variant="destructive" className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 border-destructive/20">
                                Failed
                              </Badge>
                            )}
                            {assessment.status === 'published' && (
                              <Badge variant="success" className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 border-emerald-500/20">
                                Ready
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-5 pt-0 pb-4 flex flex-col gap-2 text-[11px] text-muted-foreground font-medium border-b border-border/10">
                          <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 opacity-70 text-primary shrink-0" />
                            {assessment.numQuestions || assessment.questions?.length || 0} Questions Formulated
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 opacity-70 text-accent shrink-0" />
                            {assessment.submissions || 0} candidate submissions
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 opacity-70 text-muted-foreground shrink-0" />
                            Compiled on {assessment.createdAt ? new Date(assessment.createdAt).toISOString().split('T')[0] : "N/A"}
                          </span>
                        </CardContent>

                        <CardFooter className="p-4 justify-between items-center text-xs mt-auto bg-muted/10 h-12 rounded-b-xl">
                          <span className="text-[11px] text-muted-foreground">
                            Weight: <strong className="text-foreground">{assessment.marks || 0} Pts</strong>
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {/* Retry Action */}
                            {(assessment.status === 'failed' || assessment.status === 'draft') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={retryingId === assessment._id}
                                onClick={() => handleRetry(assessment._id)}
                                className="h-8 text-xs font-semibold px-2 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground rounded-md flex items-center gap-1"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${retryingId === assessment._id ? "animate-spin" : ""}`} /> Retry
                              </Button>
                            )}

                            {/* Interactive Delete dialog trigger */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors active:scale-95"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Assessment entry?</AlertDialogTitle>
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

                            {/* Review trigger */}
                            <Link href={`/preview/${assessment._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-1">
                                <Eye className="h-4 w-4" /> {assessment.status === 'draft' ? "Watch" : "Preview"}
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

            {/* TABULAR DATA TABLE VIEW */}
            {viewMode === "table" && (
              <Card glass className="overflow-hidden border border-border/40 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/15 border-b border-border/20 text-muted-foreground font-bold uppercase text-[9px] tracking-wider select-none">
                        <th className="py-4 px-5">Assessment Details</th>
                        <th className="py-4 px-4">Subject</th>
                        <th className="py-4 px-4">Class/Grade</th>
                        <th className="py-4 px-4 text-center">Questions</th>
                        <th className="py-4 px-4 text-center">Weight (Pts)</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4">Compiled Date</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {paginatedAssessments.map((assessment) => {
                        const difficultyTag = assessment.tags?.[0] || "intermediate";
                        const diffColors = {
                          beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          intermediate: "bg-primary/10 text-primary border-primary/20",
                          expert: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        };

                        return (
                          <tr key={assessment._id} className="hover:bg-muted/5 transition-colors group">
                            <td className="py-4 px-5">
                              <div className="space-y-0.5">
                                <div className="text-sm font-semibold text-foreground truncate max-w-xs">{assessment.title}</div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                  <Badge className={`text-[8px] px-1 py-0 border ${diffColors[difficultyTag as keyof typeof diffColors]}`}>
                                    {difficultyTag}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs font-medium text-foreground">{assessment.subject}</td>
                            <td className="py-4 px-4 text-xs font-semibold text-muted-foreground">{assessment.classGrade}</td>
                            <td className="py-4 px-4 text-xs font-bold text-center text-foreground">{assessment.numQuestions || assessment.questions?.length || 0}</td>
                            <td className="py-4 px-4 text-xs font-mono font-bold text-center text-primary">{assessment.marks || 0}</td>
                            <td className="py-4 px-4 text-center">
                              {assessment.status === 'draft' && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 border border-primary/20 animate-pulse">
                                  Compiling
                                </Badge>
                              )}
                              {assessment.status === 'failed' && (
                                <Badge variant="destructive" className="text-[8px] px-2 py-0.5 border border-destructive/20">
                                  Failed
                                </Badge>
                              )}
                              {assessment.status === 'published' && (
                                <Badge variant="success" className="text-[8px] px-2 py-0.5 border border-emerald-500/20">
                                  Ready
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-4 text-[10px] font-mono text-muted-foreground">
                              {assessment.createdAt ? new Date(assessment.createdAt).toISOString().split('T')[0] : "N/A"}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {(assessment.status === 'failed' || assessment.status === 'draft') && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={retryingId === assessment._id}
                                    onClick={() => handleRetry(assessment._id)}
                                    className="h-8 text-xs font-semibold px-2 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground rounded-md flex items-center gap-1"
                                  >
                                    <RefreshCw className={`h-3.5 w-3.5 ${retryingId === assessment._id ? "animate-spin" : ""}`} /> Retry
                                  </Button>
                                )}

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
                                      <AlertDialogTitle>Remove Assessment entry?</AlertDialogTitle>
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

                                <Link href={`/preview/${assessment._id}`}>
                                  <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-1">
                                    <Eye className="h-4 w-4" /> Preview
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card glass className="p-10 text-center max-w-lg mx-auto space-y-6 border border-border/40 shadow-lg mt-6">
            <EmptyStateIllustration />
            
            <div className="space-y-2">
              <Heading variant="h3" className="text-lg font-bold">No assessments found</Heading>
              <Text variant="muted" className="text-xs leading-relaxed px-6">
                We couldn't find any generated assessments matching your current query parameters or filters. Try adjusting your filter terms or create a new custom AI assessment!
              </Text>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs font-semibold px-4"
                onClick={() => { setSearchQuery(""); setDifficultyFilter("all"); setStatusFilter("all"); }}
              >
                Clear filter search
              </Button>
              <Link href="/create">
                <Button 
                  variant="gradient" 
                  size="sm" 
                  className="rounded-full text-xs font-semibold px-5 shadow-md"
                >
                  Create New Assessment
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* --- PAGINATION TOOLBAR --- */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-2 select-none">
            <span className="text-[11px] text-muted-foreground font-semibold">
              Showing page {currentPage} of {totalPages} ({filteredAssessments.length} total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
