import MudEvent from '../../../events/mud-event';

import type ChannelInterface from '../channel-interface';
import type CharacterInterface from '../../../characters/character-interface';

export interface ChannelReceivePayload {
    channel: ChannelInterface;
    message: string;
    sender: CharacterInterface;
}

export class ChannelReceiveEvent extends MudEvent<ChannelReceivePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'channel-receive';
    public channel: ChannelInterface;
    public message: string;
    public sender: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ChannelReceiveEvent;
