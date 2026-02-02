import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character, CharacterArea } from '../../domain/entities/character.entity';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async getActiveCharacters(): Promise<Character[]> {
    return this.characterRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getCharactersByArea(area: CharacterArea): Promise<Character[]> {
    return this.characterRepository.find({
      where: { area, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getCharacterForArea(area: CharacterArea): Promise<Character | null> {
    return this.characterRepository.findOne({
      where: { area, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getCharacterById(id: string): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id },
    });
    if (!character) {
      throw new NotFoundException('Character not found');
    }
    return character;
  }

  async getRandomGreeting(characterId: string): Promise<string | null> {
    const character = await this.getCharacterById(characterId);
    if (!character.greetings || character.greetings.length === 0) {
      return character.catchphrase || null;
    }
    const randomIndex = Math.floor(Math.random() * character.greetings.length);
    return character.greetings[randomIndex];
  }

  formatCharacter(character: Character) {
    return {
      id: character.id,
      name: character.name,
      displayName: character.displayName || character.name,
      description: character.description,
      avatarUrl: character.avatarUrl,
      fullImageUrl: character.fullImageUrl,
      area: character.area,
      defaultMood: character.defaultMood,
      catchphrase: character.catchphrase,
      customColors: character.customColors,
    };
  }
}
