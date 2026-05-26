"use client";

import * as React from "react";
import { useTheme } from "@/hooks/use-theme";
import { Heading, Text, Code } from "@/components/ui/typography";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { FadeIn, ScaleIn, StaggerContainer, StaggerChild } from "@/components/ui/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Info, 
  Layers
} from "lucide-react";

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("buttons");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  
  // States for checkbox dropdowns
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showActivityLog, setShowActivityLog] = React.useState(false);

  // Triggering custom toasts
  const triggerSuccessToast = () => {
    toast({
      title: "Assessment Created successfully!",
      description: "Your AI Assessment 'React Fundamentals' has been compiled.",
      variant: "success" as any, // Premium success variant
    });
  };

  const triggerErrorToast = () => {
    toast({
      title: "Generation Failed",
      description: "The Gemini AI model is currently overloaded. Please try again.",
      variant: "destructive",
    });
  };

  const triggerInfoToast = () => {
    toast({
      title: "Real-time sync established",
      description: "Socket connection sync is active in room 204.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden selection:bg-primary/20">
      <Toaster />

      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-veda-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-veda-indigo-500/10 blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white shadow-md shadow-veda-purple-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500">
                Veda AI
              </span>
              <span className="text-xs text-muted-foreground ml-1.5 font-medium px-2 py-0.5 rounded-full bg-muted border border-border/40">
                Design System
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full shadow-sm hover:scale-105 transition-all duration-200"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-veda-indigo-500" />
              )}
            </Button>
            <Button variant="gradient" size="sm" className="hidden sm:inline-flex rounded-full">
              Get Started <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Container>
      </header>

      <main className="pb-24">
        {/* Hero Section */}
        <Section size="sm" className="relative border-b border-border/40 bg-muted/20">
          <Container>
            <div className="max-w-3xl">
              <Badge variant="gradient" className="mb-4">
                Version 1.0.0 Stable
              </Badge>
              <Heading variant="gradient" className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight leading-tight">
                Veda AI Design Foundation
              </Heading>
              <Text variant="lead" className="mt-4 text-muted-foreground text-lg sm:text-xl font-light">
                A premium, pixel-perfect, accessible component library and spacing token hierarchy crafted specifically for the AI Assessment Creator platform. Built with Next.js 15, Tailwind v3, and Framer Motion.
              </Text>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#components">
                  <Button variant="gradient" size="lg" className="rounded-full shadow-md">
                    Explore Components
                  </Button>
                </a>
                <a href="#typography">
                  <Button variant="glass" size="lg" className="rounded-full">
                    Typography scale
                  </Button>
                </a>
              </div>
            </div>
          </Container>
        </Section>

        <Container className="mt-12">
          {/* Colors Palette Section */}
          <Section id="colors" className="border-b border-border/20">
            <div className="mb-8">
              <Heading variant="h2" as="h2">Color System</Heading>
              <Text className="text-muted-foreground mt-1">Harmony scaled HSL tailored tokens supporting neutral light and dark visual aesthetics.</Text>
            </div>

            <Grid cols={1} mdCols={2} gap={6}>
              {/* Brand Colors */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-veda-purple-500" />
                    Veda Brand Scales
                  </CardTitle>
                  <CardDescription>Brand primaries driving the main gradients, button flows, and highlight systems.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Purple */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veda Purple (Primary)</span>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      <div className="h-12 bg-veda-purple-50 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(270, 100%, 97%)', color: 'hsl(270, 60%, 28%)' }}>50</div>
                      <div className="h-12 bg-veda-purple-200 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(270, 90%, 85%)', color: 'hsl(270, 60%, 28%)' }}>200</div>
                      <div className="h-12 bg-veda-purple-500 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(270, 75%, 55%)' }}>500</div>
                      <div className="h-12 bg-veda-purple-700 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(270, 65%, 38%)' }}>700</div>
                      <div className="h-12 bg-veda-purple-900 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(270, 55%, 20%)' }}>900</div>
                    </div>
                  </div>

                  {/* Indigo */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veda Indigo (Accent)</span>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      <div className="h-12 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono" style={{ backgroundColor: 'hsl(243, 100%, 97%)', color: 'hsl(243, 65%, 40%)' }}>50</div>
                      <div className="h-12 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(243, 95%, 92%)', color: 'hsl(243, 65%, 40%)' }}>100</div>
                      <div className="h-12 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(243, 75%, 59%)' }}>500</div>
                      <div className="h-12 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(243, 70%, 50%)' }}>600</div>
                      <div className="h-12 rounded flex flex-col justify-end p-1.5 text-[10px] font-mono text-white" style={{ backgroundColor: 'hsl(243, 65%, 40%)' }}>700</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Theme Colors */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-veda-indigo-500" />
                    Neutral UI Theme Variables
                  </CardTitle>
                  <CardDescription>Core theme scales mapped directly to light/dark CSS variables.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Background</span>
                    <div className="h-12 rounded-lg border border-border/60 bg-background shadow-inner flex items-center justify-center text-xs font-semibold">
                      Background
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Foreground</span>
                    <div className="h-12 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                      Foreground
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Card</span>
                    <div className="h-12 rounded-lg border border-border bg-card text-card-foreground flex items-center justify-center text-xs font-semibold">
                      Card Base
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Muted</span>
                    <div className="h-12 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold text-center px-1">
                      Muted Content
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Primary</span>
                    <div className="h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      Primary
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Accent</span>
                    <div className="h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold">
                      Accent
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Border</span>
                    <div className="h-12 rounded-lg border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      --border
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">Input</span>
                    <div className="h-12 rounded-lg border border-input flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      --input
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Typography Scale */}
          <Section id="typography" className="border-b border-border/20">
            <div className="mb-8">
              <Heading variant="h2" as="h2">Typography System</Heading>
              <Text className="text-muted-foreground mt-1">Inter for modern sans-serif readability, JetBrains Mono for clean code formatting.</Text>
            </div>

            <Card glass className="p-6">
              <div className="space-y-8">
                {/* Heading Scales */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-4 border-b border-border/40 pb-2">Heading Elements (`Heading` component)</span>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-4">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">h1 / variant="h1"</span>
                      <Heading variant="h1" className="flex-1">The quick brown fox jumps over the lazy dog</Heading>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-4">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">h2 / variant="h2"</span>
                      <Heading variant="h2" className="flex-1">The quick brown fox jumps over the lazy dog</Heading>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-4">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">h3 / variant="h3"</span>
                      <Heading variant="h3" className="flex-1">The quick brown fox jumps over the lazy dog</Heading>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-4">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">variant="gradient"</span>
                      <Heading variant="gradient" className="flex-1">AI Powered Assessment Creation</Heading>
                    </div>
                  </div>
                </div>

                {/* Body/Text Scales */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-4 border-b border-border/40 pb-2">Text Elements (`Text` and `Code` components)</span>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-3">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">variant="lead"</span>
                      <Text variant="lead" className="flex-1">
                        A beautiful assessment creator utilizing state-of-the-art Large Language Models.
                      </Text>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-3">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">variant="p" (Body)</span>
                      <Text variant="p" className="flex-1 mt-0">
                        This is the standard body text. It is designed to read cleanly and have comfortable line height formatting across desktop monitor sizes and phone screens.
                      </Text>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-3">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">variant="small"</span>
                      <Text variant="small" className="flex-1">
                        This is the helper label text or microcopy frequently shown inside panels.
                      </Text>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-border/20 pb-3">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">variant="muted"</span>
                      <Text variant="muted" className="flex-1">
                        This is muted text used for secondary information such as dates, categories, and tags.
                      </Text>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                      <span className="text-xs font-mono text-muted-foreground min-w-[150px]">`Code` element</span>
                      <div className="flex-1">
                        To run the local server, run the command <Code>npm run dev</Code> in the workspace directory.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Spacing & Layout section */}
          <Section id="layout" className="border-b border-border/20">
            <div className="mb-8">
              <Heading variant="h2" as="h2">Layout Wrappers & Spacing Rulers</Heading>
              <Text className="text-muted-foreground mt-1">Responsive padding containers, layout grid controllers, and spacing guidelines.</Text>
            </div>

            <Grid cols={1} mdCols={3} gap={6}>
              <Card glass className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Grid Controls</CardTitle>
                  <CardDescription>Responsive Grid layout with semantic wrappers ensuring strict 4-8-12px padding flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Grid cols={1} smCols={3} gap={4}>
                    <div className="h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border/80 text-xs font-mono">
                      Column 1 (smCols: 3)
                    </div>
                    <div className="h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border/80 text-xs font-mono">
                      Column 2 (smCols: 3)
                    </div>
                    <div className="h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border/80 text-xs font-mono">
                      Column 3 (smCols: 3)
                    </div>
                  </Grid>
                  
                  <Grid cols={1} smCols={2} gap={4}>
                    <div className="h-14 rounded-lg bg-gradient-to-r from-veda-purple-500/10 to-veda-purple-500/20 flex items-center justify-center border border-veda-purple-500/20 text-xs font-mono">
                      Span 1 of 2
                    </div>
                    <div className="h-14 rounded-lg bg-gradient-to-r from-veda-indigo-500/10 to-veda-indigo-500/20 flex items-center justify-center border border-veda-indigo-500/20 text-xs font-mono">
                      Span 2 of 2
                    </div>
                  </Grid>
                </CardContent>
              </Card>

              <Card glass>
                <CardHeader>
                  <CardTitle>Active Breakpoints</CardTitle>
                  <CardDescription>Mobile-first view scales mapping automatically under Tailwind.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-muted border border-border/40">
                    <span className="font-semibold">Mobile (Base)</span>
                    <span className="text-muted-foreground">&lt; 640px</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted border border-border/40">
                    <span className="font-semibold text-veda-purple-500">sm (Tablet)</span>
                    <span className="text-muted-foreground">&gt;= 640px</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted border border-border/40">
                    <span className="font-semibold text-veda-indigo-500">md (Laptop)</span>
                    <span className="text-muted-foreground">&gt;= 768px</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted border border-border/40">
                    <span className="font-semibold text-primary">lg (Desktop)</span>
                    <span className="text-muted-foreground">&gt;= 1024px</span>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Micro-Animations & Motion transitions */}
          <Section id="motion" className="border-b border-border/20">
            <div className="mb-8">
              <Heading variant="h2" as="h2">Micro-Animations & Motion Transitions</Heading>
              <Text className="text-muted-foreground mt-1">Lightweight wrappers for Framer Motion giving micro-interactive visual elevation.</Text>
            </div>

            <Grid cols={1} mdCols={2} gap={6}>
              <Card glass>
                <CardHeader>
                  <CardTitle>Spring Entry Transitions</CardTitle>
                  <CardDescription>Visual animations utilizing physics-based cubic béziers for premium feeling entry effects.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ScaleIn delay={0.1} className="p-4 rounded-xl border bg-muted flex items-center justify-center flex-col gap-1 hover:border-primary/30 transition-all duration-300">
                      <Sparkles className="h-5 w-5 text-veda-purple-500" />
                      <span className="text-[11px] font-mono">ScaleIn</span>
                    </ScaleIn>
                    <FadeIn direction="up" delay={0.2} className="p-4 rounded-xl border bg-muted flex items-center justify-center flex-col gap-1 hover:border-primary/30 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-veda-indigo-500 rotate-[-45deg]" />
                      <span className="text-[11px] font-mono">FadeIn Up</span>
                    </FadeIn>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardHeader>
                  <CardTitle>List Stagger Effects</CardTitle>
                  <CardDescription>Clean item sequential delays making loading lists look smooth and highly polished.</CardDescription>
                </CardHeader>
                <CardContent>
                  <StaggerContainer className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((item) => (
                      <StaggerChild key={item} className="p-3 rounded-lg bg-background border border-border/80 text-center shadow-sm">
                        <div className="h-1.5 w-6 rounded-full bg-primary/30 mx-auto mb-2" />
                        <span className="text-xs font-semibold">Item {item}</span>
                      </StaggerChild>
                    ))}
                  </StaggerContainer>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Interactive Reusable Component Showcase */}
          <Section id="components">
            <div className="mb-8">
              <Heading variant="h2" as="h2">Component Library</Heading>
              <Text className="text-muted-foreground mt-1">Robust, type-safe, highly interactive, and accessible UI controls.</Text>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap p-1 gap-1 bg-muted/40">
                <TabsTrigger value="buttons">Buttons & Badges</TabsTrigger>
                <TabsTrigger value="inputs">Inputs & Dropdowns</TabsTrigger>
                <TabsTrigger value="cards">Cards & Tabs</TabsTrigger>
                <TabsTrigger value="loaders">Loaders & Skeletons</TabsTrigger>
                <TabsTrigger value="modals">Modals & Dialogs</TabsTrigger>
                <TabsTrigger value="toasts">Toast Notifications</TabsTrigger>
              </TabsList>

              {/* Buttons and Badges Tab */}
              <TabsContent value="buttons" className="space-y-6 focus-visible:ring-0 mt-0">
                <Card glass>
                  <CardHeader>
                    <CardTitle>Button Profiles</CardTitle>
                    <CardDescription>Standard actions featuring click scales, subtle gradients, and glass structures.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand options */}
                    <div>
                      <span className="text-xs font-mono text-muted-foreground block mb-2">Premium Variants</span>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="gradient">Gradient Action</Button>
                        <Button variant="glow">Glow Highlight</Button>
                        <Button variant="glass">Glass Button</Button>
                      </div>
                    </div>

                    {/* Standard options */}
                    <div>
                      <span className="text-xs font-mono text-muted-foreground block mb-2">Standard UI Variants</span>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost link</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                    </div>

                    {/* Sizes */}
                    <div>
                      <span className="text-xs font-mono text-muted-foreground block mb-2">Sizing Scale</span>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="gradient" size="sm">Small (sm)</Button>
                        <Button variant="gradient" size="default">Default</Button>
                        <Button variant="gradient" size="lg">Large (lg)</Button>
                        <Button variant="outline" size="icon"><Sparkles className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Badges */}
                <Card glass>
                  <CardHeader>
                    <CardTitle>Capsule Badges</CardTitle>
                    <CardDescription>Small information tags with custom colors and micro border profiles.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2.5">
                    <Badge variant="default">Primary Base</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="gradient">Gradient tag</Badge>
                    <Badge variant="accent">Accent Glow</Badge>
                    <Badge variant="success" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Completed
                    </Badge>
                    <Badge variant="warning" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Warning
                    </Badge>
                    <Badge variant="info" className="flex items-center gap-1">
                      <Info className="h-3 w-3" /> Draft
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inputs and Dropdowns */}
              <TabsContent value="inputs" className="space-y-6 focus-visible:ring-0 mt-0">
                <Card glass>
                  <CardHeader>
                    <CardTitle>Text Fields</CardTitle>
                    <CardDescription>Interactive text input elements with active border glows.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Standard Premium Input</label>
                      <Input type="text" placeholder="Enter assessment title..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Password Field</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Disabled Input</label>
                      <Input type="text" placeholder="Generating AI responses..." disabled />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Radix Select Trigger</label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (10 Questions)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (20 Questions)</SelectItem>
                          <SelectItem value="expert">Expert (30 Questions)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Dropdowns */}
                <Card glass>
                  <CardHeader>
                    <CardTitle>Action Dropdowns</CardTitle>
                    <CardDescription>Accessible glassmorphic list components frequently used inside layouts.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Trigger Dropdown Menu</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Profile Settings
                          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Billing Plan
                          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={showStatusBar}
                          onCheckedChange={setShowStatusBar}
                        >
                          Show Status Bar
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={showActivityLog}
                          onCheckedChange={setShowActivityLog}
                        >
                          Show Activity Log
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          Log out
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cards and Tabs */}
              <TabsContent value="cards" className="space-y-6 focus-visible:ring-0 mt-0">
                <Grid cols={1} mdCols={3} gap={6}>
                  <Card hover>
                    <CardHeader>
                      <CardTitle className="text-lg">Elevation Hover Lift</CardTitle>
                      <CardDescription>Standard card configured with custom hover lift micro-transition.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Hovering this card causes it to grow slightly, elevating its shadow properties and highlighting its border with a subtle brand tint.
                    </CardContent>
                  </Card>

                  <Card glass hover>
                    <CardHeader>
                      <CardTitle className="text-lg">Glass Morphic Card</CardTitle>
                      <CardDescription>Glow border matching background backdrop blur layers.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      An extremely premium aesthetic matching modern dark and light design styles. Perfect for dashboard stats.
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Card Actions Footer</CardTitle>
                      <CardDescription>Clean flex footer panels for card elements.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Includes pre-aligned footers for action triggers.
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                      <Button variant="ghost" size="sm">Cancel</Button>
                      <Button variant="gradient" size="sm">Save</Button>
                    </CardFooter>
                  </Card>
                </Grid>
              </TabsContent>

              {/* Loaders and Skeletons */}
              <TabsContent value="loaders" className="space-y-6 focus-visible:ring-0 mt-0">
                <Card glass>
                  <CardHeader>
                    <CardTitle>Loader Primitives</CardTitle>
                    <CardDescription>Diverse indicators signaling processes, uploads, and AI runs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Traditional Spinner */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono text-muted-foreground">Spinner Indicator</span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Loader variant="spinner" size="sm" />
                          <Loader variant="spinner" size="md" />
                          <Loader variant="spinner" size="lg" color="accent" />
                        </div>
                      </div>

                      {/* Dot bounce */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono text-muted-foreground">Pulsing Dots</span>
                        <div className="flex items-center gap-3 mt-1.5 h-12">
                          <Loader variant="pulse" size="sm" />
                          <Loader variant="pulse" size="md" color="accent" />
                          <Loader variant="pulse" size="lg" />
                        </div>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-2 max-w-md">
                      <span className="text-xs font-mono text-muted-foreground">Infinite Sliding Progress Bar (Perfect for AI generation states)</span>
                      <Loader variant="bar" size="md" />
                    </div>
                  </CardContent>
                </Card>

                {/* Skeletons */}
                <Card glass>
                  <CardHeader>
                    <CardTitle>Shimmer Skeletons</CardTitle>
                    <CardDescription>Pulsing skeleton panels simulating real-time loading sequences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-6">
                      <Skeleton className="h-4 w-[100%]" />
                      <Skeleton className="h-4 w-[85%]" />
                      <Skeleton className="h-4 w-[50%]" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Modals & Dialogs */}
              <TabsContent value="modals" className="space-y-6 focus-visible:ring-0 mt-0">
                <Card glass>
                  <CardHeader>
                    <CardTitle>Modal overlays</CardTitle>
                    <CardDescription>Radix primitives driving actions, inputs, and confirmations with glass backdrops.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    {/* Regular Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="gradient">Open Form Dialog</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create Assessment Topic</DialogTitle>
                          <DialogDescription>
                            Configure the subject matter and details for the AI generation model.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold text-muted-foreground">Topic Subject</label>
                            <Input id="name" placeholder="e.g. React hooks" className="col-span-3" />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold text-muted-foreground">Target Audience</label>
                            <Input id="username" placeholder="e.g. Frontend developer" className="col-span-3" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                          <Button variant="gradient" onClick={() => setDialogOpen(false)}>Generate Topic</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Alert Dialog */}
                    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Open Danger Confirmation</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the assessment draft and all compiled question listings. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => setAlertOpen(false)} className="bg-destructive hover:bg-destructive/90 text-white">Delete Assessment</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Toast Notifications */}
              <TabsContent value="toasts" className="space-y-6 focus-visible:ring-0 mt-0">
                <Card glass>
                  <CardHeader>
                    <CardTitle>Toast Alerts</CardTitle>
                    <CardDescription>Event based feedback notices that slide in dynamically.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={triggerSuccessToast} className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                      Trigger Success Notice
                    </Button>
                    
                    <Button variant="outline" onClick={triggerErrorToast} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      Trigger Error Notice
                    </Button>

                    <Button variant="outline" onClick={triggerInfoToast}>
                      Trigger Neutral Notice
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Section>
        </Container>
      </main>
    </div>
  );
}
