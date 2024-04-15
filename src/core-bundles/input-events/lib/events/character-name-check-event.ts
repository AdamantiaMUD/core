import StreamEvent from '../../../../lib/events/stream-event.js';

import type Account from '../../../../lib/players/account.js';

export interface CharacterNameCheckPayload {
    account: Account;
    name: string;
}

export class CharacterNameCheckEvent extends StreamEvent<CharacterNameCheckPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'character-name-check';
    public account!: Account;
    public name!: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterNameCheckEvent;
