
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Find Verified Hostels & PGs | UniNest',
    description: 'Discover verified student hostels and PG accommodations. Browse by location, amenities, and price. Book your perfect stay with UniNest.',
};

export const revalidate = 60; // Cache for 60 seconds

async function getHostels() {
    const supabase = createClient();

    // Fetch products in the Hostel category that are active
    const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(full_name, avatar_url, handle)')
        .eq('category', 'Hostel')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching hostels:', error);
        return [];
    }

    return data || [];
}

export default async function HostelsPage() {
    const hostels = await getHostels();

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            {/* Hero Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 primary-gradient opacity-10" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                <div className="relative max-w-7xl mx-auto text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                        <Home className="size-3.5 mr-1.5" /> Verified Accommodations
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight mb-4">
                        Find Your Perfect <span className="text-primary">Student Home</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Browse verified hostels and PG accommodations near your college.
                        All listings are checked for safety, amenities, and fair pricing.
                    </p>
                </div>
            </section>

            {/* Hostels Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {hostels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hostels.map((hostel) => (
                            <Link key={hostel.id} href={`/hostels/${hostel.id}`}>
                                <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                                        {hostel.image_url ? (
                                            <Image
                                                src={hostel.image_url}
                                                alt={hostel.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Home className="size-16 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-white/90 text-foreground shadow-sm">
                                                ₹{hostel.price.toLocaleString()}/month
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {hostel.name}
                                        </h3>

                                        {hostel.location && (
                                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                                                <MapPin className="size-3.5 mr-1.5 flex-shrink-0" />
                                                <span className="line-clamp-1">{hostel.location}</span>
                                            </div>
                                        )}

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {hostel.description}
                                        </p>

                                        {/* Amenities preview */}
                                        {hostel.amenities && hostel.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {hostel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {hostel.amenities.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{hostel.amenities.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <div className="flex items-center gap-2">
                                                {hostel.profiles?.avatar_url && (
                                                    <Image
                                                        src={hostel.profiles.avatar_url}
                                                        alt={hostel.profiles.full_name || 'Owner'}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    by {hostel.profiles?.full_name || 'Unknown'}
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
                            <Home className="size-10 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Hostels Listed Yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Be the first to list your hostel or PG on UniNest and reach thousands of students.
                        </p>
                        <Link href="/marketplace/new">
                            <Button size="lg">
                                List Your Property
                            </Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            {hostels.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                        Own a Hostel or PG?
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        List your property on UniNest and connect with thousands of students
                                        looking for verified accommodations near their colleges.
                                    </p>
                                    <Link href="/marketplace/new" className="w-fit">
                                        <Button size="lg">
                                            List Your Property <ArrowRight className="size-4 ml-2" />
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
