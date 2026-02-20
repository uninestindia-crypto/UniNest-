import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env before groq imports 
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { generateText } from './src/ai/groq';

async function test() {
    console.log('Testing Groq SDK integration...');
    console.log('Loaded Key 1:', process.env.GROQ_API_KEY_1?.substring(0, 10) + '...');
    try {
        const response = await generateText('Hello! Can you help me find a room in a hostel? Respond in exactly 20 words.', []);
        console.log('\n--- AI Assistant Response ---');
        console.log(response);
        console.log('-----------------------------\n');
        console.log('✅ AI Assistant is working successfully!');
    } catch (error) {
        console.error('❌ AI Assistant test failed:', error);
    }
}

test();
