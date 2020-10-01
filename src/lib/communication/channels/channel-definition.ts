import type ChannelAudience from '../audiences/channel-audience';
import type ChannelMessageFormatter from './channel-message-formatter';
import type PlayerRole from '../../players/player-role';

export interface ChannelDefinition {
    aliases?: string[];
    audience?: ChannelAudience;
    bundle?: string;
    color?: string | string[];
    description?: string;
    formatter?: {
        sender: ChannelMessageFormatter;
        target: ChannelMessageFormatter;
    };
    minRequiredRole?: PlayerRole;
    name: string;
}

export default ChannelDefinition;
