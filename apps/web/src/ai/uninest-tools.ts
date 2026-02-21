/**
 * UniNest AI Tool Definitions
 *
 * These tools are passed to the Groq SDK's `tools` parameter to enable
 * autonomous tool-calling by the llama-3.3-70b-versatile model.
 *
 * Domain I (Marketplace): search_marketplace, get_item_details, draft_marketplace_order
 * Domain II (Workspace): search_opportunities, draft_application_responses, submit_workspace_application
 */

import type Groq from 'groq-sdk';

type ToolDefinition = Groq.Chat.Completions.ChatCompletionTool;

export const uninestTools: ToolDefinition[] = [
  // ─── MARKETPLACE TOOLS ─────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'search_marketplace',
      description:
        'Search the Uninest Marketplace for items across 4 categories: hostel, library, food_mess, product. Returns a list of matching items with name, price, location, and key details. Use this when a user wants to find or browse items.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['hostel', 'library', 'food_mess', 'product'],
            description: 'The marketplace category to search in.',
          },
          query: {
            type: 'string',
            description:
              'Optional search query to filter results by name or description.',
          },
          location: {
            type: 'string',
            description: 'Optional location filter (e.g., city or area name).',
          },
          max_price: {
            type: 'number',
            description: 'Optional maximum price filter in INR.',
          },
          min_price: {
            type: 'number',
            description: 'Optional minimum price filter in INR.',
          },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_item_details',
      description:
        'Retrieve full details for a specific Marketplace item by its ID. Returns comprehensive information including description, amenities, images, reviews, and availability. Use this after the user selects an item from search results.',
      parameters: {
        type: 'object',
        properties: {
          item_id: {
            type: 'number',
            description: 'The unique ID of the marketplace item.',
          },
        },
        required: ['item_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'draft_marketplace_order',
      description:
        'Prepare a draft order for a Marketplace item. This does NOT process payment — the user must click the "Confirm & Pay" button on the UI to complete the transaction. Use this only after the user has explicitly selected an item and confirmed they want to proceed.',
      parameters: {
        type: 'object',
        properties: {
          item_id: {
            type: 'number',
            description: 'The product/hostel/library ID to order.',
          },
          quantity: {
            type: 'number',
            description: 'The quantity to order. Default is 1.',
            default: 1,
          },
        },
        required: ['item_id'],
      },
    },
  },

  // ─── WORKSPACE TOOLS ───────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'search_opportunities',
      description:
        'Search the Uninest Workspace for career opportunities including internships and competitions. Returns a list of matching opportunities with role, company, stipend, location, and deadlines.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['internship', 'competition'],
            description: 'The type of opportunity to search for.',
          },
          query: {
            type: 'string',
            description:
              'Optional search query to filter by role, company, or field.',
          },
          location: {
            type: 'string',
            description: 'Optional location filter.',
          },
          min_stipend: {
            type: 'number',
            description:
              'Optional minimum stipend filter in INR (internships only).',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'draft_application_responses',
      description:
        'Generate a professional, creative application draft for a specific opportunity. The AI creates an essay_draft and skills_list tailored to the opportunity requirements. This draft must be reviewed and approved by the user before submission.',
      parameters: {
        type: 'object',
        properties: {
          opportunity_id: {
            type: 'number',
            description: 'The ID of the internship or competition to apply for.',
          },
          opportunity_type: {
            type: 'string',
            enum: ['internship', 'competition'],
            description: 'The type of opportunity.',
          },
          user_background: {
            type: 'string',
            description:
              'Brief summary of the user\'s skills and background to personalize the draft.',
          },
        },
        required: ['opportunity_id', 'opportunity_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_workspace_application',
      description:
        'Submit the approved application for an opportunity. This should ONLY be called after the user has explicitly reviewed and approved the draft. Never call without user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          opportunity_id: {
            type: 'number',
            description: 'The ID of the opportunity to apply for.',
          },
          opportunity_type: {
            type: 'string',
            enum: ['internship', 'competition'],
            description: 'The type of opportunity.',
          },
          cover_letter: {
            type: 'string',
            description: 'The finalized cover letter / application essay.',
          },
        },
        required: ['opportunity_id', 'opportunity_type', 'cover_letter'],
      },
    },
  },
];

/**
 * The comprehensive system prompt for the UniNest AI Agent.
 * Implements the behavioral rules from the master documentation:
 * - No-Hallucination Mandate
 * - One Step at a Time Protocol
 * - Financial Security Guardrails
 * - Clarification Gate
 * - Source Fidelity Directive
 */
export const UNINEST_SYSTEM_PROMPT = `You are the UniNest AI Assistant — a smart, friendly, and precise co-pilot for students using the UniNest platform.

## YOUR IDENTITY
You help students with two domains:
1. **MARKETPLACE** — Find hostels, libraries, food mess, and products for daily student life.
2. **WORKSPACE** — Discover internships and competitions, and help craft winning applications.

## CRITICAL RULES (NEVER BREAK THESE)

### Rule 1: Zero Hallucinations
- ONLY recommend items/opportunities returned by your tools.
- NEVER invent names, prices, locations, or availability.
- If no results are found, say so honestly and offer alternatives.

### Rule 2: One Step at a Time
- NEVER search AND order/apply in the same turn.
- Always present options first, then wait for the user to choose before proceeding.
- Sequence: Search → Present → User Selects → Action

### Rule 3: Financial Security
- You CANNOT process payments. After drafting an order, tell the user to click "Confirm & Pay" on the UI.
- NEVER ask for or handle financial credentials.

### Rule 4: Clarification First
- If a request is vague (e.g., "find something for me"), ask a clarifying question before calling any tool.
- You must be >90% certain of intent before triggering a tool.

### Rule 5: Draft Approval (Workspace)
- When drafting applications, ALWAYS present the draft to the user first.
- NEVER call submit_workspace_application without explicit user approval.

## BEHAVIORAL STYLE
- **Marketplace mode**: Be concise and efficient. Let the visual cards do the heavy lifting. Your text should be a brief confirmation header.
- **Workspace mode**: Be a collaborative co-pilot. Help craft compelling narratives. Be professional, active, and persuasive — not generic.
- Keep responses under 200 words unless drafting application content.
- Use a warm, student-friendly tone. No corporate jargon.

## TOOL USAGE
- Use search_marketplace for finding items across hostel, library, food_mess, product categories.
- Use get_item_details when a user wants more info about a specific search result.
- Use draft_marketplace_order ONLY when user explicitly wants to order a selected item.
- Use search_opportunities for finding internships or competitions.
- Use draft_application_responses to help write application essays.
- Use submit_workspace_application ONLY after user approves the draft.

When you receive tool results, present them in a friendly summary. The UI will automatically render visual cards for the data.`;
