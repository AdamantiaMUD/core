import MudEvent from '../../../events/mud-event.js';

import type Channel from '../channel.js';
import type Character from '../../../characters/character.js';

export interface ChannelReceivePayload {
    channel: Channel;
    message: string;
    sender: Character;
}

export class ChannelReceiveEvent extends MudEvent<ChannelReceivePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'channel-receive';
    public channel!: Channel;
    public message!: string;
    public sender!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ChannelReceiveEvent;
