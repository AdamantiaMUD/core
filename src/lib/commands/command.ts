import CommandType from './command-type';
import PlayerRole from '../players/player-role';

import type GameStateData from '../game-state-data';
import type Player from '../players/player';
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

export type CommandDefinitionBuilder = (state?: GameStateData) => CommandDefinition;

export interface CommandDefinitionFactory {
    aliases?: string[];
    command: (state?: GameStateData) => CommandExecutable;
    metadata?: SimpleMap;
    name: string;
    requiredRole?: PlayerRole;
    type?: CommandType;
    usage?: string;
}

export type CommandExecutable = (
    args: string,
    player: Player,
    alias?: string,
    ...argV: unknown[]
) => void;

/**
 * In game command. See the {@link http://ranviermud.com/extending/commands/|Command guide}
 */
export class Command {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public aliases: string[];
    public bundle: string;
    public file: string;
    public func: CommandExecutable;
    public metadata: SimpleMap;
    public name: string;
    public requiredRole: PlayerRole;
    public type: CommandType;
    public usage: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(bundle: string, name: string, def: CommandDefinition, file: string) {
        this.bundle = bundle;
        this.type = def.type ?? CommandType.COMMAND;
        this.name = name;
        this.func = def.command;
        this.aliases = def.aliases ?? [];
        this.usage = def.usage ?? this.name;
        this.requiredRole = def.requiredRole ?? PlayerRole.PLAYER;
        this.file = file;
        this.metadata = def.metadata ?? {};
    }

    public execute(args: string, player: Player, alias: string = '', ...argV: unknown[]): void {
        this.func(args, player, alias, ...argV);
    }
}

export default Command;
