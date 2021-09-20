import MudEvent from '../../events/mud-event';

export interface PlayerCurrencyGainedPayload {
    amount: number;
    denomination: string;
}

export class PlayerCurrencyGainedEvent extends MudEvent<PlayerCurrencyGainedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'currency-gained';
    public amount!: number;
    public denomination!: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerCurrencyGainedEvent;
