import Character from '../characters/character';
import GameState from '../game-state';
import Player from '../players/player';

export interface CombatEngine {
    buildPrompt(player: Player): string;
    chooseCombatant(attacker: Character): Character;
    findCombatant(attacker: Player, search: string): Character;
    handleDeath(state: GameState, victim: Character, killer?: Character): void;
    startRegeneration(state: GameState, combatant: Character): void;
    updateRound(state: GameState, attacker: Character): boolean;
}

export default CombatEngine;
