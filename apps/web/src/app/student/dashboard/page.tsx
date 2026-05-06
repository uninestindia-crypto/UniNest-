import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, MapPin, Search, Calendar, ChevronRight, Home, LayoutGrid, Compass, MessageSquare, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Student Dashboard | UniNest',
  description: 'Your central hub for campus life.',
};

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 max-w-lg mx-auto relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Student" />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Good Morning,</p>
            <h1 className="text-sm font-semibold">Alex Sharma</h1>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50 relative">
          <Calendar className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm"
            placeholder="Search hostels, internships..."
          />
        </div>

        {/* AI Co-Pilot Banner */}
        <Link href="/ai/chat" className="block relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/20 transition-transform hover:scale-[1.02]">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                AI Active
              </div>
              <h2 className="text-xl font-bold mb-1">Your Campus Co-Pilot</h2>
              <p className="text-sm text-indigo-100 max-w-[200px]">Ask me to find housing, draft essays, or locate the best mess.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
        </Link>

        {/* Quick Actions (Modules) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Explore Modules</h3>
            <Link href="#" className="text-xs font-semibold text-primary flex items-center">
              View All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/marketplace?category=Hostel" className="bg-card border p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                <Home className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm">Housing</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">142 verified PGs</p>
            </Link>
            
            <Link href="/workspace/internships" className="bg-card border p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm">Internships</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">24 new roles</p>
            </Link>
            
            <Link href="/marketplace" className="bg-card border p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm">Marketplace</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Books & Essentials</p>
            </Link>
            
            <Link href="/exams" className="bg-card border p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm">Exam Prep</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">NEET, JEE &amp; more</p>
            </Link>
          </div>
        </div>

        {/* Personalized Feed */}
        <div>
          <h3 className="text-lg font-bold mb-4">Recommended for You</h3>
          <div className="space-y-4">
            <div className="bg-card border p-4 rounded-[1.5rem] flex gap-4 shadow-sm">
              <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=200" alt="Hostel" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h4 className="font-semibold text-sm truncate">Premium Student Housing</h4>
                <p className="text-[11px] text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> 1.2km from campus
                </p>
                <div className="mt-2 text-sm font-bold text-primary">₹8,500/mo</div>
              </div>
            </div>
            
            <div className="bg-card border p-4 rounded-[1.5rem] flex gap-4 shadow-sm">
              <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center border-2 border-dashed">
                <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">New Internship</div>
                <h4 className="font-semibold text-sm truncate">Frontend Developer Intern</h4>
                <p className="text-[11px] text-muted-foreground mt-1">TechCorp India • Remote</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Nav (Mobile Only) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm h-16 bg-background/90 backdrop-blur-xl border rounded-[2rem] shadow-2xl flex items-center justify-around px-2 z-50">
        <Link href="/student/dashboard" className="flex flex-col items-center justify-center w-12 h-12 text-primary">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link href="/marketplace?category=Hostel" className="flex flex-col items-center justify-center w-12 h-12 text-muted-foreground hover:text-foreground transition-colors">
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Explore</span>
        </Link>
        <div className="relative -top-5">
          <Link href="/ai/chat" className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-xl shadow-indigo-500/30 text-white hover:scale-105 transition-transform">
            <Bot className="h-6 w-6" />
          </Link>
        </div>
        <Link href="/workspace" className="flex flex-col items-center justify-center w-12 h-12 text-muted-foreground hover:text-foreground transition-colors">
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Work</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center w-12 h-12 text-muted-foreground hover:text-foreground transition-colors">
          <Avatar className="h-6 w-6 border">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
