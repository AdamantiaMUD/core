import StreamEvent from '../../../../lib/events/stream-event.js';

import type Account from '../../../../lib/players/account.js';

export interface FinishCharacterPayload {
    account: Account;
    name: string;
}

export class FinishCharacterEvent extends StreamEvent<FinishCharacterPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'stream-finish-character';
    public account!: Account;
    public name!: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default FinishCharacterEvent;
