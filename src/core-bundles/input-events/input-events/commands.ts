import {EventEmitter} from 'events';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';

import CommandParser from '../../bundle-example-lib/lib/CommandParser';
import InvalidCommandError from '../../bundle-example-lib/lib/InvalidCommandError';
import RestrictedCommandError from '../../bundle-example-lib/lib/RestrictedCommandError';

const {
    NoPartyError,
    NoRecipientError,
    NoMessageError,
} = ChannelErrors;

const {prompt, sayAt} = Broadcast;

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it
 */
export const commands: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>, player: Player) => {
        socket.once('data', (buf: Buffer) => {
            const loop = (): void => {
                socket.emit('commands', player);
            };

            const data = buf.toString().trim();

            if (!data.length) {
                loop();

                return;
            }

            player.setMeta('lastCommandTime', Date.now());

            try {
                const result = CommandParser.parse(state, data, player);

                if (!result) {
                    throw new Error('Could not parse command');
                }

                switch (result.type) {
                    case CommandType.MOVEMENT:
                        player.emit('move', result);

                        break;

                    case CommandType.COMMAND: {
                        const {requiredRole = PlayerRole.PLAYER} = result.command;

                        if (requiredRole > player.role) {
                            throw new RestrictedCommandError();
                        }

                        // commands have no lag and are not queued, just immediately execute them
                        result.command.execute(result.args, player, result.originalCommand);

                        break;
                    }

                    case CommandType.CHANNEL: {
                        const {channel} = result;

                        if (
                            channel.minRequiredRole !== null
                            && channel.minRequiredRole > player.role
                        ) {
                            throw new RestrictedCommandError();
                        }

                        // same with channels
                        try {
                            channel.send(state, player, result.args);
                        }
                        catch (error) {
                            if (error instanceof NoPartyError) {
                                sayAt(player, "You aren't in a group.");
                            }
                            else if (error instanceof NoRecipientError) {
                                sayAt(player, 'Send the message to whom?');
                            }
                            else if (error instanceof NoMessageError) {
                                sayAt(player, `\r\nChannel: ${channel.name}`);
                                sayAt(player, `Syntax: ${channel.getUsage()}`);

                                if (channel.description) {
                                    sayAt(player, channel.description);
                                }
                            }
                        }

                        break;
                    }

                    case CommandType.SKILL: {
                        /*
                         * See bundles/ranvier-player-events/player-events.js
                         * commandQueued and updateTick for when these actually
                         * get executed
                         */
                        player.queueCommand(
                            {
                                execute: () => {
                                    player.emit('useAbility', result.skill, result.args);
                                },
                                label: data,
                                lag: 0,
                            },
                            result.skill.lag || state.Config.get('skillLag') || 1000
                        );

                        break;
                    }

                    /* no default */
                }
            }
            catch (error) {
                if (error instanceof InvalidCommandError) {
                    // check to see if room has a matching context-specific command
                    const roomCommands = player.room.getMeta('commands');
                    const [commandName, ...args] = data.split(' ');

                    if (roomCommands && roomCommands.includes(commandName)) {
                        player.room.emit('command', player, commandName, args.join(' '));
                    }
                    else {
                        sayAt(player, 'Huh?');
                        Logger.warn(`WARNING: Player tried non-existent command '${data}'`);
                    }
                }
                else if (error instanceof RestrictedCommandError) {
                    sayAt(player, "You can't do that.");
                }
                else {
                    Logger.error(error);
                }
            }

            prompt(player);

            loop();
        });
    },
};

export default commands;
