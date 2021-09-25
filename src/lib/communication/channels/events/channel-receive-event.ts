import MudEvent from '../../../events/mud-event';

import type Channel from '../channel';
import type Character from '../../../characters/character';

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
