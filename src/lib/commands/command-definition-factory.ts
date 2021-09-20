import type CommandExecutable from './command-executable';
import type CommandType from './command-type';
import type GameStateData from '../game-state-data';
import type PlayerRole from '../players/player-role';
import type SimpleMap from '../util/simple-map';

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
