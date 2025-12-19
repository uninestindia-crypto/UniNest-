"use client";

import Image from "next/image";
import { useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [mainApi, setMainApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    // If no images, provide a fallback
    const displayImages = images.length > 0 ? images : ["https://picsum.photos/seed/product-detail/800/600"];

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Image View */}
            <div className="relative w-full overflow-hidden rounded-xl border bg-muted/20">
                <Carousel setApi={setMainApi} className="w-full">
                    <CarouselContent>
                        {displayImages.map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={src}
                                        alt={`${productName} view ${index + 1}`}
                                        fill
                                        className="object-contain" // Use contain to show full product, or cover for lifestyle feel
                                        priority={index === 0}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Show arrows only if multiple images */}
                    {displayImages.length > 1 && (
                        <>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </>
                    )}
                </Carousel>
            </div>

            {/* Thumbnails - only show if multiple images */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 snap-x">
                    {displayImages.map((src, index) => (
                        <button
                            key={index}
                            onClick={() => mainApi?.scrollTo(index)}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all snap-start",
                                current === index
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={src}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
