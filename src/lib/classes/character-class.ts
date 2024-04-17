import type Character from '../characters/character.js';
import type GameStateData from '../game-state-data.js';

export interface CharacterClass {
    name: string;
    description: string;
    abilityTable: Record<number, Record<string, unknown>>;
    setup: (state: GameStateData, character: Character) => void;
}

export default CharacterClass;
