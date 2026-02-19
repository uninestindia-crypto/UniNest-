export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
    role: AIMessageRole;
    content: string;
}

export interface AIChatRequest {
    messages: AIMessage[];
    context?: string;
}

export interface AIChatResponse {
    message: string;
}
