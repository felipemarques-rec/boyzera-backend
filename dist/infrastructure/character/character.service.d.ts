import { Repository } from 'typeorm';
import { Character, CharacterArea } from '../../domain/entities/character.entity';
export declare class CharacterService {
    private characterRepository;
    constructor(characterRepository: Repository<Character>);
    getActiveCharacters(): Promise<Character[]>;
    getCharactersByArea(area: CharacterArea): Promise<Character[]>;
    getCharacterForArea(area: CharacterArea): Promise<Character | null>;
    getCharacterById(id: string): Promise<Character>;
    getRandomGreeting(characterId: string): Promise<string | null>;
    formatCharacter(character: Character): {
        id: string;
        name: string;
        displayName: string;
        description: string;
        avatarUrl: string;
        fullImageUrl: string;
        area: CharacterArea;
        defaultMood: import("../../domain/entities/character.entity").CharacterMood;
        catchphrase: string;
        customColors: {
            primary?: string;
            secondary?: string;
            accent?: string;
        };
    };
}
