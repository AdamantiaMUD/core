import type PlayerRole from './player-role';
import type {SerializedCharacter} from '../characters/character';

export interface SerializedPlayer extends SerializedCharacter {
    experience: number;
    prompt: string;
    role: PlayerRole;
}

export default SerializedPlayer;
