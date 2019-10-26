import CharacterClass from './character-class';
import Player from '../players/player';

export interface PlayerClass extends CharacterClass {
    levelUp(player: Player, newLevel: number): void;
}

export default PlayerClass;
