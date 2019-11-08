import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import Logger from '../../../lib/util/logger';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamChooseCharacterEvent} from './choose-character';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamDeleteCharacterPayload {
    account: Account;
}

export const StreamDeleteCharacterEvent: StreamEventConstructor<StreamDeleteCharacterPayload> = class extends StreamEvent<StreamDeleteCharacterPayload> {
    public NAME: string = 'delete-character';
    public account: Account;
};

/**
 * Delete character event
 */
export const evt: StreamEventListenerFactory<StreamDeleteCharacterPayload> = {
    name: new StreamDeleteCharacterEvent().getName(),
    listener: (): StreamEventListener<StreamDeleteCharacterPayload> => (stream: TransportStream<EventEmitter>, {account}) => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        say('\r\n------------------------------');
        say('|      Delete a Character');
        say('------------------------------');

        const characters = account.characters.filter(currChar => currChar.deleted === false);

        const options = [];

        characters.forEach(char => {
            options.push({
                display: `Delete <b>${char.username}</b>`,
                onSelect: () => {
                    /* eslint-disable-next-line max-len */
                    write(`<b>Are you sure you want to delete <b>${char.username}</b>?</b> <cyan>[Y/n]</cyan> `);

                    stream.socket.once('data', (buf: Buffer) => {
                        say('');

                        const confirmation = buf.toString()
                            .trim()
                            .toLowerCase();

                        if (!(/[yn]/u).test(confirmation)) {
                            say('<b>Invalid Option</b>');

                            stream.dispatch(new StreamChooseCharacterEvent({account}));

                            return;
                        }

                        if (confirmation === 'n') {
                            say('No one was deleted...');

                            stream.dispatch(new StreamChooseCharacterEvent({account}));

                            return;
                        }

                        say(`Deleting ${char.username}`);
                        account.deleteCharacter(char.username);
                        say('Character deleted.');

                        stream.dispatch(new StreamChooseCharacterEvent({account}));
                    });
                },
            });
        });

        options.push({display: ''});

        options.push({
            display: 'Go back to main menu',
            onSelect: () => {
                stream.dispatch(new StreamChooseCharacterEvent({account}));
            },
        });

        let optionI = 0;

        options.forEach(opt => {
            if (opt.onSelect) {
                optionI += 1;
                say(`| <cyan>[${optionI}]</cyan> ${opt.display}`);
            }
            else {
                say(`| <b>${opt.display}</b>`);
            }
        });

        stream.write('|\r\n`-> ');

        stream.socket.once('data', (buf: Buffer) => {
            const choice = parseInt(buf.toString().trim(), 10) - 1;

            if (isNaN(choice)) {
                stream.dispatch(new StreamChooseCharacterEvent({account}));

                return;
            }

            const selection = options.filter(opt => Boolean(opt.onSelect))[choice];

            if (selection) {
                Logger.log(`Selected ${selection.display}`);

                selection.onSelect();

                return;
            }

            stream.dispatch(new StreamChooseCharacterEvent({account}));
        });
    },
};

export default evt;
