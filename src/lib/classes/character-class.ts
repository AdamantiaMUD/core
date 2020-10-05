import type GameStateData from '../game-state-data';
import type CharacterInterface from '../characters/character-interface';

export interface CharacterClass {
    name: string;
    description: string;
    abilityTable: {
        [key: number]: {
            [key: string]: unknown;
        };
    };
    setup: (state: GameStateData, character: CharacterInterface) => void;
}

export default CharacterClass;
