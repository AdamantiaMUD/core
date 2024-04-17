import MudEvent from '../../events/mud-event.js';
import type GameStateData from '../../game-state-data.js';

export interface UpdateTickPayload {
    config?: Record<string, unknown> | true;
    state?: GameStateData;
}

export class UpdateTickEvent extends MudEvent<UpdateTickPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'update-tick';
    public config?: Record<string, unknown> | true;
    public state?: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default UpdateTickEvent;
