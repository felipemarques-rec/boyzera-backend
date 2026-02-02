import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CharacterService } from '../../infrastructure/character/character.service';
import { CharacterArea } from '../../domain/entities/character.entity';

@Controller('characters')
@UseGuards(AuthGuard('jwt'))
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  async getCharacters() {
    const characters = await this.characterService.getActiveCharacters();
    return characters.map((c) => this.characterService.formatCharacter(c));
  }

  @Get('area/:area')
  async getCharacterByArea(@Param('area') area: string) {
    const character = await this.characterService.getCharacterForArea(
      area.toUpperCase() as CharacterArea,
    );
    return character ? this.characterService.formatCharacter(character) : null;
  }

  @Get(':id')
  async getCharacter(@Param('id') id: string) {
    const character = await this.characterService.getCharacterById(id);
    return this.characterService.formatCharacter(character);
  }

  @Get(':id/greeting')
  async getGreeting(@Param('id') id: string) {
    const greeting = await this.characterService.getRandomGreeting(id);
    return { greeting };
  }
}
