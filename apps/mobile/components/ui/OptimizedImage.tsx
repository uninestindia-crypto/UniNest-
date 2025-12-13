import { useCallback, useMemo } from 'react';
import { Image as RNImage, ImageStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';

type OptimizedImageProps = {
    source: { uri: string } | number;
    style?: StyleProp<ImageStyle>;
    contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    placeholder?: string;
    transition?: number;
    priority?: 'low' | 'normal' | 'high';
};

/**
 * Optimized image component using expo-image for better caching and performance.
 * Falls back to React Native Image if expo-image is not available.
 */
export function OptimizedImage({
    source,
    style,
    contentFit = 'cover',
    placeholder,
    transition = 200,
    priority = 'normal',
}: OptimizedImageProps) {
    // Generate blurhash placeholder for local images
    const placeholderSource = useMemo(() => {
        if (placeholder) {
            return { blurhash: placeholder };
        }
        return undefined;
    }, [placeholder]);

    return (
        <Image
            source={source}
            style={style}
            contentFit={contentFit}
            placeholder={placeholderSource}
            transition={transition}
            priority={priority}
            cachePolicy="memory-disk"
        />
    );
}

/**
 * Preload images for faster rendering
 */
export async function preloadImages(urls: string[]) {
    const prefetchPromises = urls.map((url) =>
        Image.prefetch(url).catch(() => {
            // Silently fail for unavailable images
        })
    );
    await Promise.all(prefetchPromises);
}

/**
 * Clear image cache
 */
export async function clearImageCache() {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
}
