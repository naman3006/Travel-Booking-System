import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty } from 'class-validator';

class GenerateItineraryDto {
    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsString()
    @IsNotEmpty()
    days: string;

    @IsString()
    @IsNotEmpty()
    budget: string;

    @IsString()
    interests: string;
}

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-itinerary')
    generate(@Body() dto: GenerateItineraryDto) {
        return this.aiService.generateItinerary(
            dto.destination,
            dto.days,
            dto.budget,
            dto.interests,
        );
    }

    @Post('chat')
    chat(@Body('message') message: string) {
        return this.aiService.chat(message);
    }
}
