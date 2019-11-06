import EventEmitter from 'events';

import EventUtil from '../../../lib/events/event-util';
import Player from '../../../lib/players/player';
import {
    PlayerCharacterNameCheckEvent,
    PlayerCharacterNameCheckPayload,
    PlayerCreateCharacterEvent,
    PlayerFinishCharacterEvent,
} from '../../../lib/players/player-events';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

/**
 * Confirm new player name
 */
export const evt: MudEventListenerFactory<PlayerCharacterNameCheckPayload> = {
    name: PlayerCharacterNameCheckEvent.getName(),
    listener: (): MudEventListener<PlayerCharacterNameCheckPayload> => (
        player: Player,
        args: PlayerCharacterNameCheckPayload
    ) => {
        const say = EventUtil.genSay(player);
        const write = EventUtil.genWrite(player);

        /* eslint-disable-next-line max-len */
        write(`<b>${args.name} doesn't exist, would you like to create it?</b> <cyan>[y/n]</cyan> `);

        player.socket.once('data', (buf: Buffer) => {
            say('');

            const confirmation = buf.toString()
                .trim()
                .toLowerCase();

            if (!(/[yn]/u).test(confirmation)) {
                player.dispatch(new PlayerCharacterNameCheckEvent(args));

                return;
            }

            if (confirmation === 'n') {
                say("Let's try again...");

                player.dispatch(new PlayerCreateCharacterEvent({account: args.account}));

                return;
            }

            player.dispatch(new PlayerFinishCharacterEvent(args));
        });
    },
};

export default characterNameCheck;
