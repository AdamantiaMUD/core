import Channel from './channel';
import Character from '../../characters/character';
import {MudEvent, MudEventConstructor} from '../../events/mud-event';

export interface ChannelReceivePayload {
    channel: Channel;
    message: string;
    sender: Character;
}

export const ChannelReceiveEvent: MudEventConstructor<ChannelReceivePayload> = class extends MudEvent<ChannelReceivePayload> {
    public NAME: string = 'channel-receive';
    public channel: Channel;
    public message: string;
    public sender: Character;
};
