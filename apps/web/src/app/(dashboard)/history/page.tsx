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
import { 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  Trash2, 
  Eye, 
  ArrowLeft,
  ChevronRight,
  Filter
} from "lucide-react";

// Initial historical data
const initialAssessments = [
  {
    id: "react-fundamentals",
    title: "React Fundamentals",
    description: "Covers hooks, virtual DOM, and component lifecycles.",
    difficulty: "intermediate",
    questions: 10,
    created: "2026-05-24",
    averageScore: "88%",
    submissions: 24,
  },
  {
    id: "express-api-engineering",
    title: "Express API Engineering",
    description: "Middleware routing, rate limiters, and error handlers.",
    difficulty: "expert",
    questions: 15,
    created: "2026-05-22",
    averageScore: "74%",
    submissions: 18,
  },
  {
    id: "mongodb-schema-modeling",
    title: "MongoDB Schema Modeling",
    description: "Document structures, indexing strategies, and pipelines.",
    difficulty: "beginner",
    questions: 8,
    created: "2026-05-19",
    averageScore: "91%",
    submissions: 32,
  },
  {
    id: "typescript-generics",
    title: "TypeScript Generics & Types",
    description: "Mapped types, conditional types, and utility overrides.",
    difficulty: "expert",
    questions: 12,
    created: "2026-05-15",
    averageScore: "81%",
    submissions: 15,
  },
  {
    id: "css-grid-flexbox",
    title: "Modern CSS Grid & Flexbox",
    description: "Responsive alignment rulers and absolute grid layers.",
    difficulty: "beginner",
    questions: 10,
    created: "2026-05-10",
    averageScore: "95%",
    submissions: 41,
  },
  {
    id: "nextjs-server-actions",
    title: "Next.js Server Actions & SSR",
    description: "Data mutations, hydration states, and caching strategies.",
    difficulty: "intermediate",
    questions: 14,
    created: "2026-05-05",
    averageScore: "83%",
    submissions: 20,
  }
];

// Visual Empty State Illustration (matching Panel 1 in Mockups)
const EmptyStateIllustration = () => (
  <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-2">
    {/* Background Glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-veda-purple-500/10 to-veda-indigo-500/10 rounded-full blur-2xl opacity-70" />
    
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-lg">
      {/* Document Sheet */}
      <rect x="38" y="24" width="54" height="74" rx="8" className="fill-card stroke-border" strokeWidth="2.5" />
      
      {/* Horizontal text representation lines */}
      <line x1="50" y1="42" x2="72" y2="42" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="52" x2="82" y2="52" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="62" x2="78" y2="62" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="72" x2="66" y2="72" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="3" strokeLinecap="round" />
      
      {/* Red cross mark circle on top-right of sheet */}
      <circle cx="92" cy="24" r="13" fill="#EF4444" className="stroke-card" strokeWidth="2" />
      {/* White 'X' */}
      <path d="M87.5 19.5L96.5 28.5M96.5 19.5L87.5 28.5" stroke="white" strokeWidth="3" strokeLinecap="round" />

      {/* Magnifying Glass overlapping the sheet bottom-left */}
      <circle cx="48" cy="88" r="17" className="fill-card stroke-primary" strokeWidth="3" />
      <line x1="60" y1="100" x2="74" y2="114" className="stroke-primary" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function HistoryPage() {
  const { toast } = useToast();
  const [assessments, setAssessments] = React.useState(initialAssessments);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");

  // Filter listings
  const filteredAssessments = assessments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === "all" || item.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const handleDelete = (id: string) => {
    const target = assessments.find((a) => a.id === id);
    setAssessments(assessments.filter((a) => a.id !== id));
    toast({
      title: "Assessment Deleted",
      description: `'${target?.title}' catalog entry has been removed.`,
      variant: "destructive",
    });
  };

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

        <div>
          <Heading variant="h2" as="h1" className="text-2xl font-extrabold sm:text-3xl tracking-tight leading-none">
            Assessment Catalog Logs
          </Heading>
          <Text className="text-muted-foreground text-sm mt-1">Review historical generated tests, inspect student metrics, and manage catalog databases.</Text>
        </div>

        {/* --- FILTER & QUERY SEARCH BAR --- */}
        <Card glass className="p-3.5">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search query */}
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground/60" />
              <Input
                type="text"
                placeholder="Search assessments by title or subject..."
                className="pl-9 bg-background/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Select filter dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block shrink-0" />
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-background/30">
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

        {/* --- DYNAMIC HISTORY CATALOG GRID --- */}
        {filteredAssessments.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map((assessment) => {
              const diffColors = {
                beginner: "success" as const,
                intermediate: "info" as const,
                expert: "warning" as const,
              };

              return (
                <StaggerChild key={assessment.id}>
                  <Card glass hover className="h-full flex flex-col justify-between border border-border/40 shadow-sm hover:shadow-glow transition-all duration-300">
                    <CardHeader className="p-5 pb-2 flex-row justify-between items-start space-y-0 gap-3">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate leading-none">
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2 h-8 leading-snug">
                          {assessment.description}
                        </CardDescription>
                      </div>
                      <Badge variant={diffColors[assessment.difficulty as keyof typeof diffColors]} className="text-[9px] uppercase tracking-wider px-2 py-0.5 shrink-0">
                        {assessment.difficulty}
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 pb-4 flex flex-col gap-2 text-[11px] text-muted-foreground font-medium border-b border-border/10">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 opacity-70 text-primary shrink-0" />
                        {assessment.questions} Questions Formulated
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 opacity-70 text-accent shrink-0" />
                        {assessment.submissions} candidate submissions
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 opacity-70 text-muted-foreground shrink-0" />
                        Compiled on {assessment.created}
                      </span>
                    </CardContent>

                    <CardFooter className="p-4 justify-between items-center text-xs mt-auto bg-muted/10 h-12 rounded-b-xl">
                      <span className="text-[11px] text-muted-foreground">
                        Avg Grade: <strong className="text-foreground">{assessment.averageScore}</strong>
                      </span>
                      
                      <div className="flex items-center gap-2">
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
                                This will permanently delete the assessment '{assessment.title}' database log and student average scoring metrics.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(assessment.id)}
                                className="bg-destructive hover:bg-destructive/90 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Review trigger */}
                        <Link href={`/preview/${assessment.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-primary/10 hover:text-primary rounded-md flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Preview
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </StaggerChild>
              );
            })}
          </StaggerContainer>
        ) : (
          <Card glass className="p-10 text-center max-w-lg mx-auto space-y-6 border border-border/40 shadow-lg mt-6">
            {/* Visual empty illustration matching Panel 1 */}
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
                onClick={() => { setSearchQuery(""); setDifficultyFilter("all"); }}
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
      </Container>
    </Section>
  );
}
