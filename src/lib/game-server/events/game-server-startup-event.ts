import type {CommanderStatic} from 'commander';

import MudEvent from '../../events/mud-event';

export interface GameServerStartupPayload {
    commander: CommanderStatic;
}

export class GameServerStartupEvent extends MudEvent<GameServerStartupPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'startup';
    public commander: CommanderStatic;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default GameServerStartupEvent;
