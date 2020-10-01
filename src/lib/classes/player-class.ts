import type CharacterClass from './character-class';
import type Player from '../players/player';

export interface PlayerClass extends CharacterClass {
    levelUp: (player: Player, newLevel: number) => void;
}

export default PlayerClass;
