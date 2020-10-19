import type {EventEmitter} from 'events';

import Logger from '../../../lib/common/logger';
import EventUtil from '../../../lib/events/event-util';
import {ChooseCharacterEvent, DeleteCharacterEvent} from '../lib/events';
import {hasValue} from '../../../lib/util/functions';

import type InputMenuOption from '../../../lib/events/input-menu-option';
import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {CharacterBrief} from '../../../lib/players/account';
import type {DeleteCharacterPayload} from '../lib/events';

/**
 * Delete character event
 */
export const evt: StreamEventListenerFactory<DeleteCharacterPayload> = {
    name: DeleteCharacterEvent.getName(),
    listener: (): StreamEventListener<DeleteCharacterPayload> => (
        stream: TransportStream<EventEmitter>,
        {account}: DeleteCharacterPayload
    ): void => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        say('\r\n------------------------------');
        say('|      Delete a Character');
        say('------------------------------');

        const characters = account.characters.filter((char: CharacterBrief) => !char.isDeleted);

        const options: InputMenuOption[] = [];

        characters.forEach((char: CharacterBrief) => {
            options.push({
                display: `Delete <b>${char.username}</b>`,
                onSelect: () => {
                    write(`<b>Are you sure you want to delete <b>${char.username}</b>?</b> <cyan>[Y/n]</cyan> `);

                    stream.socket.once('data', (buf: Buffer) => {
                        say('');

                        const confirmation = buf.toString()
                            .trim()
                            .toLowerCase();

                        if (!(/[yn]/u).test(confirmation)) {
                            say('<b>Invalid Option</b>');

                            stream.dispatch(new ChooseCharacterEvent({account}));

                            return;
                        }

                        if (confirmation === 'n') {
                            say('No one was deleted...');

                            stream.dispatch(new ChooseCharacterEvent({account}));

                            return;
                        }

                        say(`Deleting ${char.username}`);
                        account.deleteCharacter(char.username);
                        say('Character deleted.');

                        stream.dispatch(new ChooseCharacterEvent({account}));
                    });
                },
            });
        });

        options.push({display: ''});

        options.push({
            display: 'Go back to main menu',
            onSelect: () => {
                stream.dispatch(new ChooseCharacterEvent({account}));
            },
        });

        let optionI = 0;

        options.forEach((opt: InputMenuOption) => {
            if (hasValue(opt.onSelect)) {
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
                stream.dispatch(new ChooseCharacterEvent({account}));

                return;
            }

            const selection = options.filter((opt: InputMenuOption) => Boolean(opt.onSelect))[choice];

            if (hasValue(selection)) {
                Logger.log(`Selected ${selection.display}`);

                selection.onSelect!();

                return;
            }

            stream.dispatch(new ChooseCharacterEvent({account}));
        });
    },
};

export default evt;
