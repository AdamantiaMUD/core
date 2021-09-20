import type Broadcastable from '../broadcastable';
import type Character from '../../characters/character';
import type {Colorizer} from '../colorizer';

export type ChannelMessageFormatter = (
    sender: Character,
    target: Broadcastable | null,
    message: string,
    colorify: Colorizer
) => string;

export default ChannelMessageFormatter;
