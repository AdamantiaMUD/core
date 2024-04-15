import type GameStateData from '../game-state-data.js';
import type Character from '../characters/character.js';

export interface CharacterClass {
    name: string;
    description: string;
    abilityTable: Record<number, Record<string, unknown>>;
    setup: (state: GameStateData, character: Character) => void;
}

export default CharacterClass;
