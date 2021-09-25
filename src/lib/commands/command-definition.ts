import type CommandExecutable from './command-executable';
import type CommandType from './command-type';
import type PlayerRole from '../players/player-role';
import type SimpleMap from '../util/simple-map';

export interface CommandDefinition {
    aliases?: string[];
    command: CommandExecutable;
    metadata?: SimpleMap;
    name: string;
    requiredRole?: PlayerRole;
    type?: CommandType;
    usage?: string;
}

export default CommandDefinition;
