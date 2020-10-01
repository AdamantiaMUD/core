import Channel from './channel';

/**
 * Contains registered channels
 */
export class ChannelManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public channels: Map<string, Channel> = new Map();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public add(channel: Channel): void {
        this.channels.set(channel.name, channel);
        if (channel.aliases) {
            channel.aliases.forEach(alias => this.channels.set(alias, channel));
        }
    }

    public find(search: string): Channel {
        for (const [name, channel] of this.channels.entries()) {
            if (name.startsWith(search)) {
                return channel;
            }
        }

        return undefined;
    }

    public get(name: string): Channel {
        return this.channels.get(name);
    }

    public remove(channel: Channel): void {
        this.channels.delete(channel.name);
    }
}

export default ChannelManager;
