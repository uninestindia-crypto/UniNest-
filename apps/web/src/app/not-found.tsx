
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto">
                {/* Animated 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-primary/10 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center animate-pulse">
                            <Search className="size-10 text-primary/50" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl font-bold text-foreground mb-4">
                    Oops! Page not found
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/">
                            <Home className="size-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href="/marketplace">
                            <Search className="size-4" />
                            Browse Marketplace
                        </Link>
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="border-t pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                        Looking for something specific? Try these:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/workspace/internships"
                            className="text-sm text-primary hover:underline"
                        >
                            Internships
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link
                            href="/workspace/competitions"
                            className="text-sm text-primary hover:underline"
                        >
                            Competitions
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link
                            href="/hostels"
                            className="text-sm text-primary hover:underline"
                        >
                            Hostels
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link
                            href="/support"
                            className="text-sm text-primary hover:underline"
                        >
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
