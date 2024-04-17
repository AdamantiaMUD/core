import StreamEvent from '../../../../lib/events/stream-event.js';
import type Account from '../../../../lib/players/account.js';

export interface ChooseCharacterPayload {
    account: Account;
}

export class ChooseCharacterEvent extends StreamEvent<ChooseCharacterPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'choose-character';
    public account!: Account;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ChooseCharacterEvent;
