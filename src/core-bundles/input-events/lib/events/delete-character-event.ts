import StreamEvent from '../../../../lib/events/stream-event';

import type Account from '../../../../lib/players/account';

export interface DeleteCharacterPayload {
    account: Account;
}

export class DeleteCharacterEvent extends StreamEvent<DeleteCharacterPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'delete-character';
    public account: Account;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default DeleteCharacterEvent;
