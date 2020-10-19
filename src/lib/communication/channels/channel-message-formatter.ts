import type Broadcastable from '../broadcastable';
import type {Colorizer} from '../colorizer';

export type ChannelMessageFormatter = (
    sender: Broadcastable,
    target: Broadcastable | null,
    message: string,
    colorify: Colorizer
) => string;

export default ChannelMessageFormatter;
