import GameState from '../game-state';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface UpdateTickPayload {
    config?: true | {[key: string]: any};
    state?: GameState;
}

export const UpdateTickEvent: MudEventConstructor<UpdateTickPayload> = class extends MudEvent<UpdateTickPayload> {
    public NAME: string = 'update-tick';
    public config?: {[key: string]: any};
    public state?: GameState;
};
