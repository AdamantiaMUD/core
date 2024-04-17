import type PlayerRole from '../players/player-role.js';
import type SimpleMap from '../util/simple-map.js';

import type CommandType from './command-type.js';
import type Command from './command.js';

export interface ParsedCommand {
    args: string;
    command?: Command | null;
    originalCommand?: string;
    payload?: SimpleMap;
    requiredRole?: PlayerRole;
    type: CommandType;
}

export default ParsedCommand;
