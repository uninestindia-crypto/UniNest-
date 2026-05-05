import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BookOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Student Libraries Near Your College | Uninest Marketplace',
    description: 'Browse verified study spaces and libraries near your college in India. Filter by location & amenities. Book a seat easily.',
    keywords: ['libraries near me', 'study space', 'verified libraries', 'quiet study rooms', 'student library'],
};

export const revalidate = 60; // Cache for 60 seconds

async function getLibraries() {
    const supabase = createClient();

    // Fetch products in the Library category that are active
    const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(full_name, avatar_url, handle)')
        .eq('category', 'Library')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching libraries:', error);
        return [];
    }

    return data || [];
}

export default async function LibrariesPage() {
    const libraries = await getLibraries();

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            {/* Hero Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 primary-gradient opacity-10" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                <div className="relative max-w-7xl mx-auto text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                        <BookOpen className="size-3.5 mr-1.5" /> Verified Study Spaces
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight mb-4">
                        Find Your Perfect <span className="text-primary">Study Space</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Browse verified libraries and study rooms near your college.
                        All listings are checked for safety, amenities, and comfort.
                    </p>
                </div>
            </section>

            {/* Libraries Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {libraries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {libraries.map((library) => (
                            <Link key={library.id} href={`/marketplace/library/${library.id}`}>
                                <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                                        {library.image_url ? (
                                            <Image
                                                src={library.image_url}
                                                alt={library.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="size-16 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-white/90 text-foreground shadow-sm">
                                                ₹{library.price.toLocaleString()}/month
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {library.name}
                                        </h3>

                                        {library.location && (
                                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                                                <MapPin className="size-3.5 mr-1.5 flex-shrink-0" />
                                                <span className="line-clamp-1">{library.location}</span>
                                            </div>
                                        )}

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {library.description}
                                        </p>

                                        {/* Amenities preview */}
                                        {library.amenities && library.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {library.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {library.amenities.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{library.amenities.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <div className="flex items-center gap-2">
                                                {library.profiles?.avatar_url && (
                                                    <Image
                                                        src={library.profiles.avatar_url}
                                                        alt={library.profiles.full_name || 'Owner'}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    by {library.profiles?.full_name || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                View Details <ArrowRight className="size-3" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center size-20 rounded-full bg-muted mb-6">
                            <BookOpen className="size-10 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Libraries Listed Yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Be the first to list your study space on UniNest and reach thousands of students.
                        </p>
                        <Link href="/marketplace/new">
                            <Button size="lg">
                                List Your Space
                            </Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            {libraries.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                        Own a Library or Study Space?
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        List your space on UniNest and connect with thousands of students
                                        looking for verified study environments near their colleges.
                                    </p>
                                    <Link href="/marketplace/new" className="w-fit">
                                        <Button size="lg">
                                            List Your Space <ArrowRight className="size-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                    <div className="text-center">
                                        <Users className="size-16 text-primary/30 mx-auto mb-4" />
                                        <p className="text-2xl font-bold text-primary">10,000+</p>
                                        <p className="text-sm text-muted-foreground">Students reached monthly</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}
