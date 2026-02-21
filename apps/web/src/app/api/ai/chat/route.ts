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
import { getGroqClient } from '@/ai/groq';
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
        const body = await request.json();
        const { messages: userMessages = [], message } = body;

        // Build the conversation messages array
        const messages: ChatMessage[] = [
            { role: 'system', content: UNINEST_SYSTEM_PROMPT },
        ];

        // Add conversation history
        for (const msg of userMessages) {
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
        if (message) {
            messages.push({ role: 'user', content: message });
        }

        const groq = getGroqClient();
        const toolResults: ToolResult[] = [];
        let finalResponse = '';
        let toolCallsMade: { name: string; args: any; result: ToolResult }[] = [];

        // Step 1: Initial API call with tools
        let completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages as any,
            tools: uninestTools,
            tool_choice: 'auto',
            max_tokens: 1024,
            temperature: 0.7,
        });

        let assistantMessage = completion.choices[0]?.message;

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
                const functionName = toolCall.function.name;
                let functionArgs: Record<string, any> = {};

                try {
                    functionArgs = JSON.parse(toolCall.function.arguments);
                } catch {
                    functionArgs = {};
                }

                console.log(`[UniNest AI] Tool call: ${functionName}`, functionArgs);

                const result = await executeTool(functionName, functionArgs);
                toolCallsMade.push({ name: functionName, args: functionArgs, result });

                // Add the tool result to the conversation
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                });
            }

            // Step 3: Get the model's response after tool execution
            completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: messages as any,
                tools: uninestTools,
                tool_choice: 'auto',
                max_tokens: 1024,
                temperature: 0.7,
            });

            assistantMessage = completion.choices[0]?.message;
        }

        finalResponse = assistantMessage?.content || 'I couldn\'t process that request. Please try again.';

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
                response: 'Sorry, I encountered an error. Please try again in a moment.',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
