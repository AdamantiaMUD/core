import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import Broadcast from '../../../lib/communication/broadcast';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/* eslint-disable-next-line id-length */
const {at, prompt} = Broadcast;

/**
 * Account character selection event
 */
export const chooseCharacter: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>, account: Account) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);
        const mgr = state.playerManager;

        /*
         * Player selection menu:
         * Can select existing player
         * Can create new (if less than 3 living chars)
         */
        say('\r\n------------------------------');
        say('|      Choose your fate');
        say('------------------------------');

        // This just gets their names.
        const characters = account.characters.filter(currChar => currChar.deleted === false);
        const maxCharacters = state.config.get('maxCharacters', 10);
        const canAddCharacter = characters.length < maxCharacters;

        const options = [];

        // Configure account options menu
        options.push({
            display: 'Change Password',
            onSelect: () => {
                socket.emit(
                    'change-password',
                    {account: account, nextStage: 'choose-character'}
                );
            },
        });

        if (canAddCharacter) {
            options.push({
                display: 'Create New Character',
                onSelect: () => {
                    socket.emit('create-character', account);
                },
            });
        }

        if (characters.length) {
            options.push({display: 'Login As:'});

            characters.forEach(char => {
                options.push({
                    display: char.username,
                    onSelect: async () => {
                        let player = mgr.getPlayer(char.username.toLowerCase());

                        if (player) {
                            // kill old connection
                            at(player, 'Connection taken over by another client. Goodbye.');
                            player.socket.end();

                            // link new socket
                            player.socket = socket;
                            at(player, 'Taking over old connection. Welcome.');
                            prompt(player);

                            player.socket.emit('commands', player);

                            return;
                        }

                        player = await state.playerManager.loadPlayer(
                            state,
                            char.username.toLowerCase()
                        );
                        player.socket = socket;

                        socket.emit('done', player);
                    },
                });
            });
        }

        options.push({display: ''});

        if (characters.length) {
            options.push({
                display: 'Delete a Character',
                onSelect: () => {
                    socket.emit('delete-character', account);
                },
            });
        }

        options.push({
            display: 'Delete This Account',
            onSelect: () => {
                /* eslint-disable-next-line max-len */
                say('<b>By deleting this account, all the characters will be also deleted.</b>');
                /* eslint-disable-next-line max-len */
                write('<b>Are you sure you want to delete this account? </b> <cyan>[Y/n]</cyan> ');

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

                    say(`Deleting account <b>${account.username}</b>`);
                    account.deleteAccount();
                    say('Account deleted, it was a pleasure doing business with you.');

                    socket.end();
                });
            },
        });

        options.push({
            display: 'Quit',
            onSelect: () => socket.end(),
        });

        // Display options menu

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

export default chooseCharacter;
