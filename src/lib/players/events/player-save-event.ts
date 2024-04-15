import MudEvent from '../../events/mud-event.js';

export interface PlayerSavePayload {
    callback?: () => void;
}

export class PlayerSaveEvent extends MudEvent<PlayerSavePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'save';
    public callback?: () => void;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerSaveEvent;
