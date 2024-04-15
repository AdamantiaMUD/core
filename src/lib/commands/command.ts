import CommandType from './command-type.js';
import PlayerRole from '../players/player-role.js';

import type CommandDefinition from './command-definition.js';
import type CommandExecutable from './command-executable.js';
import type Player from '../players/player.js';
import type SimpleMap from '../util/simple-map.js';

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

    public execute(args: string | null, player: Player, alias: string = '', ...argV: unknown[]): void {
        this.func(args, player, alias, ...argV);
    }
}

export default Command;
