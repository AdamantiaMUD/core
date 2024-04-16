import StreamEvent from '../../../../lib/events/stream-event.js';

import type Account from '../../../../lib/players/account.js';

export interface ConfirmPasswordPayload {
    account: Account;
    nextEvent: StreamEvent<{ account: Account }>;
}

export class ConfirmPasswordEvent extends StreamEvent<ConfirmPasswordPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'stream-confirm-password';
    public account!: Account;
    public nextEvent!: StreamEvent<{ account: Account }>;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ConfirmPasswordEvent;
