import GameState from '../game-state';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface UpdateTickPayload {
    state?: GameState;
}

export const UpdateTickEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'update-tick';
};
