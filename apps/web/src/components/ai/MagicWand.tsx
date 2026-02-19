'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/use-ai';
import { useToast } from '@/hooks/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MagicWandProps {
    onGenerate: (text: string) => void;
    context: string;
    type?: 'product' | 'hostel';
}

export function MagicWand({ onGenerate, context, type = 'product' }: MagicWandProps) {
    const { chat, isLoading } = useAi();
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!context || context.length < 5) {
            toast({
                title: "More info needed",
                description: `Please enter a few details about the ${type} first so I have some context!`,
                variant: "destructive"
            });
            return;
        }

        const systemPrompt = type === 'product'
            ? 'You are a professional copywriter for an e-commerce platform. Write a catchy, detailed, and persuasive product description based on the provided title/category. Keep it under 150 words.'
            : 'You are a professional real estate description writer. Write an inviting and detailed description for a student hostel room. Highlight amenities and convenience. Keep it under 150 words.';

        const result = await chat(`Generate a description for this ${type}: ${context}`, systemPrompt);

        if (result) {
            onGenerate(result);
            toast({
                title: "Magic happened! ✨",
                description: "AI-generated description has been applied.",
            });
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center gap-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        Magic Fill
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Auto-generate description using AI</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
