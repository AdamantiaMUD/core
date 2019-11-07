import {CommanderStatic} from 'commander';

import {MudEvent, MudEventConstructor} from './events/mud-event';

export const GameServerShutdownEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'shutdown';
};

export interface GameServerStartupPayload {
    commander: CommanderStatic;
}

export const GameServerStartupEvent: MudEventConstructor<GameServerStartupPayload> = class extends MudEvent<GameServerStartupPayload> {
    public NAME: string = 'startup';
    public commander: CommanderStatic;
};
