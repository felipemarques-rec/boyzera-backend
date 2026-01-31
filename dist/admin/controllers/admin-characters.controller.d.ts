import { Repository } from 'typeorm';
import { Character } from '../../domain/entities/character.entity';
export declare class AdminCharactersController {
    private characterRepository;
    constructor(characterRepository: Repository<Character>);
    getCharacters(): Promise<Character[]>;
    getCharacter(id: string): Promise<Character | null>;
    createCharacter(data: Partial<Character>): Promise<Character>;
    updateCharacter(id: string, data: Partial<Character>): Promise<Character | null>;
    deleteCharacter(id: string): Promise<{
        success: boolean;
    }>;
    getCharactersByArea(area: string): Promise<Character[]>;
}
