import type {EventEmitter} from 'events';

import Broadcast from '../../../lib/communication/broadcast.js';
import Logger from '../../../lib/common/logger.js';
import {
    ChangePasswordEvent,
    ChooseCharacterEvent,
    CommandLoopEvent,
    CreateCharacterEvent,
    DeleteCharacterEvent,
    LoginCompleteEvent,
} from '../lib/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';

import type CharacterBrief from '../../../lib/players/character-brief.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type InputMenuOption from '../../../lib/events/input-menu-option.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';
import type {ChooseCharacterPayload} from '../lib/events/index.js';

/* eslint-disable-next-line id-length */
const {at, prompt} = Broadcast;

/**
 * Account character selection event
 */
export const evt: StreamEventListenerFactory<ChooseCharacterPayload> = {
    name: ChooseCharacterEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<ChooseCharacterPayload> => (
        stream: TransportStream<EventEmitter>,
        {account}: ChooseCharacterPayload
    ): void => {
        const mgr = state.playerManager;

        /*
         * Player selection menu:
         * Can select existing player
         * Can create new (if less than 3 living chars)
         */
        stream.write('------------------------------');
        stream.write('|      Choose your fate');
        stream.write('------------------------------');

        // This just gets their names.
        const characters = account.characters.filter((currChar: CharacterBrief) => !currChar.isDeleted);
        const maxCharacters = state.config.get('maxCharacters', 10)!;
        const canAddCharacter = characters.length < maxCharacters;

        const options: InputMenuOption[] = [];

        // Configure account options menu
        options.push({
            display: 'Change Password',
            onSelect: () => {
                stream.dispatch(new ChangePasswordEvent({
                    account: account,
                    nextEvent: new ChooseCharacterEvent({account}),
                }));
            },
        });

        if (canAddCharacter) {
            options.push({
                display: 'Create New Character',
                onSelect: () => {
                    stream.dispatch(new CreateCharacterEvent({account}));
                },
            });
        }

        if (characters.length > 0) {
            options.push({display: 'Login As:'});

            characters.forEach((char: CharacterBrief) => {
                options.push({
                    display: char.username,
                    onSelect: async () => {
                        let player = mgr.getPlayer(char.username.toLowerCase());

                        if (hasValue(player)) {
                            // kill old connection
                            at(player, 'Connection taken over by another client. Goodbye.');
                            player.socket?.end();

                            // link new socket
                            player.socket = stream;

                            at(player, 'Taking over old connection. Welcome.');
                            prompt(player);

                            player.socket.dispatch(new CommandLoopEvent({player}));

                            return;
                        }

                        player = await state.playerManager.loadPlayer(char.username.toLowerCase());

                        player.socket = stream;

                        stream.dispatch(new LoginCompleteEvent({player}));
                    },
                });
            });
        }

        options.push({display: ''});

        if (characters.length > 0) {
            options.push({
                display: 'Delete a Character',
                onSelect: () => {
                    stream.dispatch(new DeleteCharacterEvent({account}));
                },
            });
        }

        options.push({
            display: 'Delete This Account',
            onSelect: () => {
                stream.write('{bold By deleting this account, all the characters will be also deleted.}');
                stream.write('{bold Are you sure you want to delete this account?} {cyan [Y/n]} ');

                stream.socket.once('data', (buf: Buffer) => {
                    stream.write('');

                    const confirmation = buf.toString()
                        .trim()
                        .toLowerCase();

                    if (!(/[yn]/u).test(confirmation)) {
                        stream.write('{bold Invalid Option}');

                        stream.dispatch(new ChooseCharacterEvent({account}));

                        return;
                    }

                    if (confirmation === 'n') {
                        stream.write('No one was deleted...');

                        stream.dispatch(new ChooseCharacterEvent({account}));

                        return;
                    }

                    stream.write(`Deleting account {bold ${account.username}}`);

                    account.deleteAccount();

                    stream.write('Account deleted, it was a pleasure doing business with you.');

                    stream.end();
                });
            },
        });

        options.push({
            display: 'Quit',
            onSelect: () => stream.end(),
        });

        // Display options menu

        let optionI = 0;

        options.forEach((opt: {display: string; onSelect?: () => void}) => {
            if (hasValue(opt.onSelect)) {
                optionI += 1;
                stream.write(`| {cyan [${optionI}]} ${opt.display}`);
            }
            else {
                stream.write(`| {bold ${opt.display}}`);
            }
        });

        stream.write('|\n-> ');

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
