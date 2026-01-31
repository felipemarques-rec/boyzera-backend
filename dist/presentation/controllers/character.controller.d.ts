import { CharacterService } from '../../infrastructure/character/character.service';
import { CharacterArea } from '../../domain/entities/character.entity';
export declare class CharacterController {
    private readonly characterService;
    constructor(characterService: CharacterService);
    getCharacters(): Promise<{
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
    }[]>;
    getCharacterByArea(area: string): Promise<{
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
    } | null>;
    getCharacter(id: string): Promise<{
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
    }>;
    getGreeting(id: string): Promise<{
        greeting: string | null;
    }>;
}
