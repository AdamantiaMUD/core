import MudEvent from '../../events/mud-event';

import type GameStateData from '../../game-state-data';

export interface UpdateTickPayload {
    config?: true | {[key: string]: unknown};
    state?: GameStateData;
}

export class UpdateTickEvent extends MudEvent<UpdateTickPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'update-tick';
    public config?: true | {[key: string]: unknown};
    public state?: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default UpdateTickEvent;
