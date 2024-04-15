import type Broadcastable from '../broadcastable.js';
import type Character from '../../characters/character.js';
import type {Colorizer} from '../colorizer.js';

export type ChannelMessageFormatter = (
    sender: Character,
    target: Broadcastable | null,
    message: string,
    colorify: Colorizer
) => string;

export default ChannelMessageFormatter;
