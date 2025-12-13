"use client"

import React from "react"
import {
    SidebarProvider,
    Sidebar,
    SidebarInset,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
    children: React.ReactNode
    sidebarContent: React.ReactNode
    headerContent?: React.ReactNode
    sidebarFooter?: React.ReactNode
    title?: string
    logoHref?: string
    className?: string
}

export function DashboardShell({
    children,
    sidebarContent,
    headerContent,
    sidebarFooter,
    title = "Dashboard",
    logoHref = "/",
    className,
}: DashboardShellProps) {
    return (
        <SidebarProvider>
            <Sidebar className="border-r border-border/50 bg-card">
                <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 px-6">
                    <div className="flex items-center gap-3 w-full">
                        <Logo className="size-8 text-primary" />
                        <span className="font-headline font-bold text-lg tracking-tight text-foreground/90">
                            {title}
                        </span>
                    </div>
                </SidebarHeader>
                <SidebarContent className="px-4 py-4 gap-4">
                    {sidebarContent}
                </SidebarContent>
                {sidebarFooter && (
                    <>
                        <div className="mt-auto" />
                        <SidebarFooter className="p-4 border-t border-border/50 bg-muted/10">
                            {sidebarFooter}
                        </SidebarFooter>
                    </>
                )}
            </Sidebar>
            <SidebarInset className="bg-background">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
                    <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex flex-1 items-center gap-4">
                        {headerContent}
                    </div>
                </header>
                <main className={cn("flex-1 overflow-auto p-8", className)}>
                    <div className="mx-auto max-w-7xl w-full space-y-8 animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
