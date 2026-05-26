"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import {
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  History,
  Palette,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Links Definitions
const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Quiz",
    href: "/create",
    icon: PlusCircle,
  },
  {
    name: "Assessment History",
    href: "/history",
    icon: History,
  },
  {
    name: "UI Showcase",
    href: "/design-system",
    icon: Palette,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Parse path for breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [{ name: "Veda AI", href: "#" }];

    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      const name = part
        .replace(/-/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-screen w-screen bg-background text-foreground flex relative overflow-hidden transition-colors duration-300">
      {/* Visual glowing backgrounds */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-veda-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-veda-indigo-500/5 blur-[130px] pointer-events-none" />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-64 border-r border-border/40 bg-card/40 backdrop-blur-md flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border/40 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white shadow-md shadow-veda-purple-500/10">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500">
            Veda AI
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const LinkIcon = link.icon;

            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group active:scale-[0.98]",
                    isActive
                      ? "bg-primary/10 border-l-2 border-primary text-primary shadow-inner-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <LinkIcon className={cn("h-4.5 w-4.5 transition-transform duration-200", !isActive && "group-hover:scale-105")} />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                R
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold leading-none truncate text-foreground">
                  Raushan Kumar
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate">
                  raushan@veda.ai
                </span>
              </div>
            </div>
            
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors active:scale-95"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MOBILE DRAWER SLID-OVER --- */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card/95 backdrop-blur-md border-r border-border/40 h-full p-6 shadow-glow-strong animate-in slide-in-from-left duration-300">
            {/* Close Button */}
            <div className="absolute right-4 top-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-2 mb-8 border-b border-border/20 pb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500">
                Veda AI
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                const LinkIcon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                        isActive
                          ? "bg-primary/10 border-l-2 border-primary text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <LinkIcon className="h-5 w-5" />
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User profile footer */}
            <div className="border-t border-border/20 pt-4 mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-veda-purple-500 to-veda-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    R
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold leading-none text-foreground truncate">
                      Raushan Kumar
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate">
                      raushan@veda.ai
                    </span>
                  </div>
                </div>

                <Link href="/" onClick={() => setIsMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg active:scale-95"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* --- TOP NAVIGATION BAR --- */}
        <header className="sticky top-0 z-20 h-16 w-full border-b border-border/40 bg-background/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 min-w-0">
            {/* Hamburger button (Mobile) */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-lg"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs (Desktop/Tablet) */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.href}>
                    {idx > 0 && <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />}
                    {isLast ? (
                      <span className="text-foreground font-semibold truncate">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-foreground hover:underline transition-colors shrink-0"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Top nav right toolbar */}
          <div className="flex items-center gap-3">
            {/* Search (Desktop) */}
            <div className="hidden md:flex items-center relative w-48 lg:w-64">
              <Search className="h-4 w-4 absolute left-3 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full h-9 rounded-lg border border-input pl-9 pr-3 text-xs bg-muted/20 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring focus:shadow-glow focus:border-primary/50 transition-all duration-200"
              />
            </div>

            {/* Notifications Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg relative active:scale-95"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            </Button>

            {/* Dark mode switcher toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg active:scale-95"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-veda-indigo-500" />
              )}
            </Button>
          </div>
        </header>

        {/* --- PAGE RENDER CONTAINER WITH SPRING ENTRY --- */}
        <main className="flex-1 flex flex-col relative">
          <FadeIn direction="up" distance={8} duration={0.3} className="flex-1 flex flex-col">
            {children}
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
