// app/api/tts/route.js
import { NextResponse } from 'next/server';

// Initialize Unreal Speech API credentials
// IMPORTANT: Store your API key in .env.local
const UNREALSPEECH_API_KEY = process.env.UNREAL_SPEECH_API_KEY;

// Check for API key
if (!UNREALSPEECH_API_KEY) {
  console.error(
    'TTS API Route: UNREAL_SPEECH_API_KEY environment variable not set.'
  );
}

export async function POST(request) {
  console.log('TTS API Route: Received request');

  // Check if API key is present
  if (!UNREALSPEECH_API_KEY) {
    console.error('TTS API Route: API key not configured');
    return NextResponse.json(
      { error: 'UnrealSpeech API key not configured.' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body to get the text and other parameters
    const body = await request.json();
    console.log('TTS API Route: Request body', JSON.stringify(body));

    const {
      text,
      voiceId = 'Sierra', // Updated to use a supported voice
      speed = -0.2,
      pitch = 1,
      outputFormat = 'mp3',
    } = body;

    // Validate required 'text' parameter
    if (!text) {
      console.error('TTS API Route: Missing "text" in request body');
      return NextResponse.json(
        { error: 'Missing "text" in request body' },
        { status: 400 }
      );
    }

    console.log(
      `API Route TTS: Generating speech for "${text}" with voice ${voiceId}`
    );

    // UnrealSpeech v8 API endpoint
    const apiUrl = 'https://api.v8.unrealspeech.com/stream';

    // Prepare request payload
    const payload = {
      Text: text,
      VoiceId: voiceId,
      Speed: speed,
      Pitch: pitch,
      OutputFormat: outputFormat,
    };

    console.log(
      'TTS API Route: Sending request to UnrealSpeech with payload',
      JSON.stringify(payload)
    );

    // Call the UnrealSpeech v8 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${UNREALSPEECH_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Check if API call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route TTS: Error from UnrealSpeech API: ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorText },
        { status: response.status }
      );
    }

    console.log('API Route TTS: Received audio stream.');

    // Get audio data
    const audioBuffer = await response.arrayBuffer();

    // Create response with appropriate headers
    return new Response(Buffer.from(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      },
      status: 200,
    });
  } catch (error) {
    console.error('API Route TTS: Error calling UnrealSpeech API:', error);
    // Return a JSON error response in case of failure
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}
