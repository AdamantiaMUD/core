import type CharacterClass from './character-class.js';
import type Player from '../players/player.js';

export interface PlayerClass extends CharacterClass {
    levelUp: (player: Player, newLevel: number) => void;
}

export default PlayerClass;
