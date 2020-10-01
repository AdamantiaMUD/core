import type {CommanderStatic} from 'commander';

import MudEvent from '../../events/mud-event';

export interface GameServerStartupPayload {
    commander: CommanderStatic;
}

export class GameServerStartupEvent extends MudEvent<GameServerStartupPayload> {
    public NAME: string = 'startup';
    public commander: CommanderStatic;
}

export default GameServerStartupEvent;
