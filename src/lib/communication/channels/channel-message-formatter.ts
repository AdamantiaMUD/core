import type Player from '../../players/player';
import type {Colorizer} from '../colorizer';

export type ChannelMessageFormatter = (
    sender: Player,
    target: Player | null,
    message: string,
    colorify: Colorizer
) => string;

export default ChannelMessageFormatter;
