import StreamEvent from '../../../../lib/events/stream-event.js';

import type Account from '../../../../lib/players/account.js';

export interface ChangePasswordPayload {
    account: Account;
    nextEvent: StreamEvent<{ account: Account }>;
}

export class ChangePasswordEvent extends StreamEvent<ChangePasswordPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'stream-change-password';
    public account!: Account;
    public nextEvent!: StreamEvent<{ account: Account }>;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ChangePasswordEvent;
