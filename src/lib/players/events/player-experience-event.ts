import MudEvent from '../../events/mud-event';

export interface PlayerExperiencePayload {
    amount: number;
}

export class PlayerExperienceEvent extends MudEvent<PlayerExperiencePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'experience';
    public amount: number;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerExperienceEvent;
