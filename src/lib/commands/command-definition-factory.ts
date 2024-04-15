import type CommandExecutable from './command-executable.js';
import type CommandType from './command-type.js';
import type GameStateData from '../game-state-data.js';
import type PlayerRole from '../players/player-role.js';
import type SimpleMap from '../util/simple-map.js';

export interface CommandDefinitionFactory {
    aliases?: string[];
    command: (() => CommandExecutable) | ((state: GameStateData) => CommandExecutable);
    metadata?: SimpleMap;
    name: string;
    requiredRole?: PlayerRole;
    type?: CommandType;
    usage?: string;
}

export default CommandDefinitionFactory;
