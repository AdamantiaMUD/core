import type Player from '../players/player.js';

import type CharacterClass from './character-class.js';

export interface PlayerClass extends CharacterClass {
    levelUp: (player: Player, newLevel: number) => void;
}

export default PlayerClass;
