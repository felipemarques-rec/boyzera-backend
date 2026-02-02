import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { Character } from '../../domain/entities/character.entity';

@Controller('admin/characters')
@UseGuards(AdminAuthGuard)
export class AdminCharactersController {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  @Get()
  async getCharacters() {
    return this.characterRepository.find({
      order: { area: 'ASC', sortOrder: 'ASC' },
    });
  }

  @Get(':id')
  async getCharacter(@Param('id') id: string) {
    return this.characterRepository.findOne({ where: { id } });
  }

  @Post()
  async createCharacter(@Body() data: Partial<Character>) {
    const character = this.characterRepository.create(data);
    return this.characterRepository.save(character);
  }

  @Put(':id')
  async updateCharacter(@Param('id') id: string, @Body() data: Partial<Character>) {
    await this.characterRepository.update(id, data);
    return this.characterRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  async deleteCharacter(@Param('id') id: string) {
    await this.characterRepository.delete(id);
    return { success: true };
  }

  @Get('by-area/:area')
  async getCharactersByArea(@Param('area') area: string) {
    return this.characterRepository.find({
      where: { area: area.toUpperCase() as any, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
