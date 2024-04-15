import StreamEvent from '../../../../lib/events/stream-event.js';

import type Account from '../../../../lib/players/account.js';

export interface InputPasswordPayload {
    account: Account;
}

export class InputPasswordEvent extends StreamEvent<InputPasswordPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'stream-account-password';
    public account!: Account;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default InputPasswordEvent;
