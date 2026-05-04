/**
 * UniNest AI Chat API Route
 *
 * POST /api/ai/chat
 *
 * Implements the 3-step tool-calling loop:
 * 1. Send user message + tool definitions to Groq
 * 2. If model requests a tool call, execute it and feed results back
 * 3. Return final assistant response with any tool data for UI rendering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletionWithRetries } from '@/ai/groq';
import { uninestTools, UNINEST_SYSTEM_PROMPT } from '@/ai/uninest-tools';
import { executeTool, type ToolResult } from '@/ai/tool-executor';

export const runtime = 'nodejs';
export const maxDuration = 30;

type ChatMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: any[];
    tool_call_id?: string;
    name?: string;
};

export async function POST(request: NextRequest) {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, response: 'Invalid request format.' },
                { status: 400 }
            );
        }

        const { messages: userMessages = [], message } = body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json(
                { success: false, response: 'Please provide a message.' },
                { status: 400 }
            );
        }

        // Build the conversation messages array
        const messages: ChatMessage[] = [
            { role: 'system', content: UNINEST_SYSTEM_PROMPT },
        ];

        // Add conversation history (last 20 messages for context window limits)
        const recentHistory = Array.isArray(userMessages)
            ? userMessages.slice(-20)
            : [];
        for (const msg of recentHistory) {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({
                    role: msg.role,
                    content: typeof msg.content === 'string'
                        ? msg.content
                        : JSON.stringify(msg.content),
                });
            }
        }

        // Add the new user message
        messages.push({ role: 'user', content: message.trim() });

        let toolCallsMade: { name: string; args: any; result: ToolResult }[] = [];

        // Step 1: Initial API call with tools
        let completion: any;
        try {
            completion = await createChatCompletionWithRetries(messages as any, 'llama-3.3-70b-versatile', {
                tools: uninestTools,
                tool_choice: 'auto',
                max_tokens: 1024,
                temperature: 0.7,
            });
        } catch (groqError: any) {
            console.error('[UniNest AI] Groq API call failed:', groqError?.message);
            return NextResponse.json({
                success: false,
                response: "I'm having trouble connecting to my AI brain right now. Please try again in a moment! 🔄",
                tool_calls: [],
                ui_actions: [],
            });
        }

        let assistantMessage = completion?.choices?.[0]?.message;

        if (!assistantMessage) {
            return NextResponse.json({
                success: false,
                response: "I couldn't generate a response. Please try again!",
                tool_calls: [],
                ui_actions: [],
            });
        }

        // Step 2: Tool-calling loop (max 3 iterations to prevent infinite loops)
        let iterations = 0;
        while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < 3) {
            iterations++;

            // Add the assistant's message with tool_calls to the conversation
            messages.push({
                role: 'assistant',
                content: assistantMessage.content || '',
                tool_calls: assistantMessage.tool_calls,
            });

            // Execute each tool call
            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function?.name;
                let functionArgs: Record<string, any> = {};

                try {
                    functionArgs = JSON.parse(toolCall.function?.arguments || '{}');
                } catch {
                    console.warn(`[UniNest AI] Failed to parse args for ${functionName}`);
                    functionArgs = {};
                }

                console.log(`[UniNest AI] Tool call: ${functionName}`, JSON.stringify(functionArgs));

                let result: ToolResult;
                try {
                    result = await executeTool(functionName, functionArgs);
                } catch (toolError: any) {
                    console.error(`[UniNest AI] Tool execution error for ${functionName}:`, toolError?.message);
                    result = {
                        success: false,
                        error: `Tool ${functionName} failed: ${toolError?.message || 'Unknown error'}`,
                    };
                }

                toolCallsMade.push({ name: functionName, args: functionArgs, result });

                // Add the tool result to the conversation
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                });
            }

            // Step 3: Get the model's response after tool execution
            try {
                completion = await createChatCompletionWithRetries(messages as any, 'llama-3.3-70b-versatile', {
                    tools: uninestTools,
                    tool_choice: 'auto',
                    max_tokens: 1024,
                    temperature: 0.7,
                });

                assistantMessage = completion?.choices?.[0]?.message;
            } catch (groqError: any) {
                console.error('[UniNest AI] Groq API call failed during tool loop:', groqError?.message);
                // Break out and use what we have
                assistantMessage = { content: "I found some results but had trouble summarizing them. Here's what I found!" };
                break;
            }
        }

        const finalResponse = assistantMessage?.content || "I couldn't process that request. Please try again.";

        // Determine what UI actions the frontend should take
        const uiActions = toolCallsMade
            .filter(tc => tc.result.success && tc.result.ui_action)
            .map(tc => ({
                action: tc.result.ui_action!,
                tool: tc.name,
                data: tc.result.data,
            }));

        return NextResponse.json({
            success: true,
            response: finalResponse,
            tool_calls: toolCallsMade.map(tc => ({
                name: tc.name,
                args: tc.args,
                success: tc.result.success,
                ui_action: tc.result.ui_action,
                data: tc.result.data,
            })),
            ui_actions: uiActions,
        });
    } catch (error: any) {
        console.error('[UniNest AI] Chat error:', error);
        return NextResponse.json(
            {
                success: false,
                response: "Oops! Something went wrong on our end. Please try again in a moment. 🔄",
                error: error?.message || 'Unknown error',
                tool_calls: [],
                ui_actions: [],
            },
            { status: 500 }
        );
    }
}
