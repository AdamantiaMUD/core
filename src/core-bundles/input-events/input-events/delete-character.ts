import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import Logger from '../../../lib/util/logger';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

/**
 * Delete character event
 */
export const evt: MudEventListenerFactory<> = {
export const deleteCharacter: InputEventListenerDefinition = {
    event: () => (socket: TransportStream<EventEmitter>, account: Account) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

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

                    socket.once('data', (buf: Buffer) => {
                        say('');

                        const confirmation = buf.toString()
                            .trim()
                            .toLowerCase();

                        if (!(/[yn]/u).test(confirmation)) {
                            say('<b>Invalid Option</b>');

                            socket.emit('choose-character', account);

                            return;
                        }

                        if (confirmation === 'n') {
                            say('No one was deleted...');

                            socket.emit('choose-character', account);

                            return;
                        }

                        say(`Deleting ${char.username}`);
                        account.deleteCharacter(char.username);
                        say('Character deleted.');

                        socket.emit('choose-character', account);
                    });
                },
            });
        });

        options.push({display: ''});

        options.push({
            display: 'Go back to main menu',
            onSelect: () => {
                socket.emit('choose-character', account);
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

        socket.write('|\r\n`-> ');

        socket.once('data', (buf: Buffer) => {
            const choice = parseInt(buf.toString().trim(), 10) - 1;

            if (isNaN(choice)) {
                socket.emit('choose-character', account);

                return;
            }

            const selection = options.filter(opt => Boolean(opt.onSelect))[choice];

            if (selection) {
                Logger.log(`Selected ${selection.display}`);

                selection.onSelect();

                return;
            }

            socket.emit('choose-character', account);
        });
    },
};

export default deleteCharacter;
