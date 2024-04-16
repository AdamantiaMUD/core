import type Channel from './channel.js';

/**
 * Contains registered channels
 */
export class ChannelManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public channels: Map<string, Channel> = new Map<string, Channel>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public add(channel: Channel): void {
        this.channels.set(channel.name, channel);

        channel.aliases.forEach((alias: string) =>
            this.channels.set(alias, channel)
        );
    }

    public find(search: string): Channel | null {
        for (const [name, channel] of this.channels.entries()) {
            if (name.startsWith(search)) {
                return channel;
            }
        }

        return null;
    }

    public get(name: string): Channel | null {
        return this.channels.get(name) ?? null;
    }

    public remove(channel: Channel): void {
        this.channels.delete(channel.name);
    }
}

export default ChannelManager;
