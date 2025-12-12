#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const server = new Server(
    {
        name: "studio-uninest-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_table",
                description: "Read data from a Supabase table",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: {
                            type: "string",
                            description: "The name of the table to read from",
                        },
                        limit: {
                            type: "number",
                            description: "Max number of rows to return (default 10)",
                        },
                        columns: {
                            type: "string",
                            description: "Comma-separated columns to select (default '*')",
                        }
                    },
                    required: ["table"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "read_table") {
        const args = request.params.arguments as { table: string; limit?: number; columns?: string };
        const table = args.table;
        const limit = args.limit || 10;
        const columns = args.columns || "*";

        const { data, error } = await supabase
            .from(table)
            .select(columns)
            .limit(limit);

        if (error) {
            throw new McpError(
                ErrorCode.InternalError,
                `Supabase error: ${error.message}`
            );
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }

    throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
