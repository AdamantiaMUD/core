import type Character from '../characters/character.js';
import type GameStateData from '../game-state-data.js';
import type Player from '../players/player.js';

export interface CombatEngine {
    buildPrompt: (player: Player) => string;
    chooseCombatant: (attacker: Character) => Character;
    findCombatant: (attacker: Player, search: string) => Character;
    handleDeath: (
        state: GameStateData,
        victim: Character,
        killer?: Character | null
    ) => void;
    startRegeneration: (state: GameStateData, combatant: Character) => void;
    updateRound: (state: GameStateData, attacker: Character) => boolean;
}

export default CombatEngine;
