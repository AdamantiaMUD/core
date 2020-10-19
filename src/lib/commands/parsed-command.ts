import type Command from './command';
import type CommandType from './command-type';
import type PlayerRole from '../players/player-role';
import type SimpleMap from '../util/simple-map';

export interface ParsedCommand {
    args: string;
    command?: Command | null;
    originalCommand?: string;
    payload?: SimpleMap;
    requiredRole?: PlayerRole;
    type: CommandType;
}

export default ParsedCommand;
