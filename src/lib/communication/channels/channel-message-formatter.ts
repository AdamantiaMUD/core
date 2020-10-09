import type CharacterInterface from '../../characters/character-interface';
import type {Colorizer} from '../colorizer';

export type ChannelMessageFormatter = (
    sender: CharacterInterface,
    target: CharacterInterface | null,
    message: string,
    colorify: Colorizer
) => string;

export default ChannelMessageFormatter;
