import type PlayerRole from './player-role.js';
import type {SerializedCharacter} from '../characters/character.js';

export interface SerializedPlayer extends SerializedCharacter {
    experience: number;
    prompt: string;
    role: PlayerRole;
}

export default SerializedPlayer;
