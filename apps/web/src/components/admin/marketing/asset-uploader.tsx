'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImageIcon, Trash2, Undo2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AssetUploaderProps = {
    label: string;
    description?: string;
    accept?: Record<string, string[]>;
    maxSizeMB?: number;
    currentUrl: string | null;
    previewSize?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'mobile';
    onFileChange: (file: File | null) => void;
    onRemoveChange: (remove: boolean) => void;
    disabled?: boolean;
};

const PREVIEW_SIZES = {
    sm: 'size-12',
    md: 'size-24',
    lg: 'size-32',
    xl: 'size-48',
    wide: 'aspect-video w-64',
    mobile: 'aspect-[9/16] w-32',
};

const PREVIEW_CONTAINER_SIZES = {
    sm: 'h-16 w-16',
    md: 'h-28 w-28',
    lg: 'h-36 w-36',
    xl: 'h-52 w-52',
    wide: 'h-40 w-72',
    mobile: 'h-64 w-36',
};

export default function AssetUploader({
    label,
    description,
    accept = { 'image/png': [], 'image/jpeg': [], 'image/svg+xml': [] },
    maxSizeMB = 2,
    currentUrl,
    previewSize = 'md',
    onFileChange,
    onRemoveChange,
    disabled = false,
}: AssetUploaderProps) {
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);

    // Initialize preview from currentUrl if no file is selected
    const activePreview = preview ?? (!isRemoving ? currentUrl : null);

    const processFile = useCallback((selectedFile: File) => {
        // Validate type based on accept (simplified validation)
        const acceptedTypes = Object.keys(accept);
        // Rough check on mime type
        const fileType = selectedFile.type;
        const isValidType = acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                const baseType = type.split('/')[0];
                return fileType.startsWith(baseType);
            }
            return fileType === type;
        });

        // If strict validation needed, implement better check. For now trusting input.

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: `Max size is ${maxSizeMB}MB`,
            });
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
        setIsRemoving(false);
        onFileChange(selectedFile);
        onRemoveChange(false);
    }, [accept, maxSizeMB, onFileChange, onRemoveChange, toast]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            processFile(selectedFiles[0]);
        }
    };

    const handleRemove = () => {
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setIsRemoving(true);
        onFileChange(null);
        onRemoveChange(true);
    };

    const handleReset = () => {
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setIsRemoving(false);
        onFileChange(null);
        onRemoveChange(false);
    };

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="group relative space-y-3 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/20 hover:bg-muted/30 hover:shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Label className="text-base font-medium decoration-primary/30 underline-offset-4 group-hover:underline">
                        {label}
                    </Label>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
                {(file || (currentUrl && isRemoving)) && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        disabled={disabled}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <Undo2 className="size-4" />
                        <span className="sr-only">Reset</span>
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Preview Area */}
                <div
                    className={cn(
                        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-900',
                        PREVIEW_CONTAINER_SIZES[previewSize],
                        !activePreview && 'border-dashed'
                    )}
                >
                    {activePreview ? (
                        <>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                            <Image
                                src={activePreview}
                                alt={`${label} preview`}
                                fill
                                className="object-contain p-2"
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                            <ImageIcon className="size-8" />
                            <span className="text-[10px] uppercase tracking-wider">Empty</span>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="flex-1 space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById(`upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
                        className={cn(
                            'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 px-6 py-6 transition-colors hover:bg-muted/10',
                            isDragActive && 'border-primary bg-primary/5',
                            disabled && 'cursor-not-allowed opacity-60'
                        )}
                    >
                        <input
                            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            type="file"
                            className="hidden"
                            accept={Object.keys(accept).join(',')}
                            onChange={handleFileSelect}
                            disabled={disabled}
                        />
                        <div className="rounded-full bg-background p-2 shadow-sm ring-1 ring-border">
                            <UploadCloud className="size-5 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                {isDragActive ? 'Drop file here' : 'Click or drag to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(maxSizeMB * 1024).toFixed(0)}KB max size
                            </p>
                        </div>
                    </div>

                    {currentUrl && !isRemoving && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                                className="h-8 w-full border-dashed text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="mr-2 size-3" />
                                Remove existing
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
