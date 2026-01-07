import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    // Models to try in order
    private modelNames = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
    ];

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('⚠️ GEMINI_API_KEY is not defined in .env');
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }


    // Helper to extract retry delay from error or default to exponential backoff
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async callWithRetry(fn: () => Promise<any>, retries = 3, initialDelay = 5000): Promise<any> {
        let currentDelay = initialDelay;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                // Check for 429 or quota exceeded
                const isRateLimit = error.message?.includes('429') ||
                    error.message?.includes('Quota exceeded') ||
                    error.status === 429;

                if (isRateLimit && i < retries - 1) {
                    // Try to extract dynamic retry delay from error message
                    // Example: "Please retry in 12.192063212s"
                    const match = error.message?.match(/Please retry in (\d+(\.\d+)?)s/);
                    let waitTime = currentDelay;

                    if (match && match[1]) {
                        // Parse seconds and convert to ms, add 1s buffer
                        const seconds = parseFloat(match[1]);
                        waitTime = Math.ceil(seconds * 1000) + 1000;
                        console.warn(`⏳ API requested wait. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                    } else {
                        console.warn(`⏳ Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                        // Only exponentially backoff if no specific time was given
                        currentDelay *= 2;
                    }

                    await this.delay(waitTime);
                } else {
                    throw error;
                }
            }
        }
    }

    async generateItinerary(
        destination: string,
        days: string,
        budget: string,
        interests: string,
    ) {
        if (!this.genAI) {
            throw new InternalServerErrorException(
                'AI Service is not configured properly (Missing API Key)',
            );
        }

        const prompt = `
      You are an expert travel planner. Create a detailed ${days}-day itinerary for a trip to ${destination}.
      The traveler has a ${budget} budget and is interested in: ${interests}.
      
      Requirements:
      1. Provide a day-by-day plan.
      2. Suggest specific places to visit, restaurants to try, and estimated costs per activity.
      3. Format the response as a clean HTML string (using <h3> for days, <ul> for activities, <b> for highlights) that can be directly rendered in a frontend app. Do not include markdown ticks (\`\`\`).
      4. Keep it engaging and practical.
    `;

        let lastError = null;

        // Retry logic with different models
        for (const modelName of this.modelNames) {
            try {
                console.log(`🤖 Trying AI Model: ${modelName}...`);
                const model = this.genAI.getGenerativeModel({ model: modelName });
                const result = await this.callWithRetry(() => model.generateContent(prompt));
                const response = await result.response;
                return { itinerary: response.text() };
            } catch (error) {
                console.warn(`⚠️ Model ${modelName} failed:`, error.message);
                if (error.response) {
                    console.error('Error Response:', JSON.stringify(error.response, null, 2));
                }
                lastError = error;
                // Continue to next model
            }
        }

        console.error('❌ All AI models failed.');
        throw new InternalServerErrorException(
            'Failed to generate itinerary after trying multiple models. Please try again later.',
        );
    }

    async chat(message: string) {
        if (!this.genAI) {
            throw new InternalServerErrorException('AI Service not configured');
        }

        const prompt = `
      You are a helpful, knowledgeable, and friendly travel assistant for a travel booking website.
      User Question: "${message}"
      
      Guidelines:
      1. Answer concisely and accurately.
      2. If the question is about travel, destinations, visas, or packing, provide helpful advice.
      3. If the question is unrelated to travel (e.g., coding, math), politely steer the conversation back to travel.
      4. Use emojis to be friendly.
    `;

        // Retry logic
        for (const modelName of this.modelNames) {
            try {
                const model = this.genAI.getGenerativeModel({ model: modelName });
                const result = await this.callWithRetry(() => model.generateContent(prompt));
                const response = await result.response;
                return { reply: response.text() };
            } catch (error) {
                console.warn(`Chat: Model ${modelName} failed`, error.message);
                if (error.response) {
                    console.error('Chat Error Response:', JSON.stringify(error.response, null, 2));
                }
            }
        }

        throw new InternalServerErrorException('AI Chat currently unavailable');
    }
}
