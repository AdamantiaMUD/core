import type Character from '../../characters/character';
import type GameStateData from '../../game-state-data';
import type PlayerRole from '../../players/player-role';
import type ChannelAudience from '../audiences/channel-audience';
import type Colorizer from '../colorizer';
import type ChannelMessageFormatter from './channel-message-formatter';

export interface ChannelInterface {
    aliases: string[];
    audience: ChannelAudience;
    bundle: string | null;
    color: string | string[] | null;
    description: string | null;
    formatter: {sender: ChannelMessageFormatter; target: ChannelMessageFormatter};
    minRequiredRole: PlayerRole | null;
    name: string;

    colorify: Colorizer;
    describeSelf: (sender: Character) => void;
    formatToRecipient: ChannelMessageFormatter;
    formatToSender: ChannelMessageFormatter;
    getUsage: () => string;
    send: (state: GameStateData, sender: Character, msg: string) => void;
}

export default ChannelInterface;
