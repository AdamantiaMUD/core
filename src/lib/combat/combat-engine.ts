import type CharacterInterface from '../characters/character-interface';
import type GameStateData from '../game-state-data';
import type Player from '../players/player';

export interface CombatEngine {
    buildPrompt: (player: Player) => string;
    chooseCombatant: (attacker: CharacterInterface) => CharacterInterface;
    findCombatant: (attacker: Player, search: string) => CharacterInterface;
    handleDeath: (state: GameStateData, victim: CharacterInterface, killer?: CharacterInterface) => void;
    startRegeneration: (state: GameStateData, combatant: CharacterInterface) => void;
    updateRound: (state: GameStateData, attacker: CharacterInterface) => boolean;
}

export default CombatEngine;
