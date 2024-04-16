import type { Command } from 'commander';

import MudEvent from '../../events/mud-event.js';

export interface GameServerStartupPayload {
    commander: Command;
}

export class GameServerStartupEvent extends MudEvent<GameServerStartupPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'startup';
    public commander!: Command;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default GameServerStartupEvent;
