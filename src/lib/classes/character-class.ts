import type GameStateData from '../game-state-data';
import type Character from '../characters/character';

export interface CharacterClass {
    name: string;
    description: string;
    abilityTable: {
        [key: number]: {
            [key: string]: unknown;
        };
    };
    setup: (state: GameStateData, character: Character) => void;
}

export default CharacterClass;
