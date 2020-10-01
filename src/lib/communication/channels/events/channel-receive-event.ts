import MudEvent from '../../../events/mud-event';

import type ChannelInterface from '../channel-interface';
import type Character from '../../../characters/character';

export interface ChannelReceivePayload {
    channel: ChannelInterface;
    message: string;
    sender: Character;
}

export class ChannelReceiveEvent extends MudEvent<ChannelReceivePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'channel-receive';
    public channel: ChannelInterface;
    public message: string;
    public sender: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ChannelReceiveEvent;
