// app/api/chat/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// OpenAI 타입 정의
type OpenAIInstance = InstanceType<typeof OpenAI>;

// Initialize OpenAI client using environment variable
// IMPORTANT: Store your API key in .env.local as OPENAI_API_KEY
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAIInstance | null = null;

if (openaiApiKey) {
  openai = new OpenAI({ apiKey: openaiApiKey });
} else {
  console.error('Chat API Route: OPENAI_API_KEY environment variable not set.');
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

export async function POST(request: NextRequest) {
  // Check if the client was initialized (API key was present)
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI client not initialized. Check API Key.' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body to get the message history
    const body = (await request.json()) as RequestBody;
    // Expecting messages in the format: [{ role: 'user'/'assistant', content: '...' }, ...]
    const { messages } = body;

    // Validate the messages input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "messages" array in request body' },
        { status: 400 }
      );
    }

    console.log('API Route Chat: Calling OpenAI Chat Completion API...');

    // Call the OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Specify the model (e.g., "gpt-4")
      messages: messages, // Pass the conversation history
      // temperature: 0.7,    // Optional: Control randomness
      // max_tokens: 150,     // Optional: Limit response length
    });

    // Extract the AI's reply from the response
    const reply = completion.choices[0]?.message?.content;

    // Check if a valid reply was received
    if (reply) {
      console.log('API Route Chat: Received reply from OpenAI:', reply);
      // Return the AI's reply as JSON
      return NextResponse.json({ reply: reply.trim() });
    } else {
      // Handle cases where the response structure might be unexpected
      console.error(
        'API Route Chat: No valid reply content found in OpenAI response:',
        completion
      );
      throw new Error('Failed to get valid content from OpenAI response');
    }
  } catch (error) {
    console.error('API Route Chat: Error calling OpenAI API:', error);
    // Return a JSON error response in case of failure
    return NextResponse.json(
      { error: 'Failed to get AI response', details: (error as Error).message },
      { status: 500 }
    );
  }
}
