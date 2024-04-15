import type {EventEmitter} from 'events';

import CommandParser from '../../../lib/commands/command-parser.js';
import CommandType from '../../../lib/commands/command-type.js';
import Logger from '../../../lib/common/logger.js';
import PlayerRole from '../../../lib/players/player-role.js';
import {CommandLoopEvent} from '../lib/events/index.js';
import {InvalidCommandError, RestrictedCommandError} from '../../../lib/commands/errors/index.js';
import {
    NoMessageError,
    NoPartyError,
    NoRecipientError,
    UnknownChannelError,
} from '../../../lib/communication/channels/errors/index.js';
import {PlayerMoveEvent} from '../../../lib/players/events/index.js';
import {RoomCommandEvent} from '../../../lib/locations/events/index.js';
import {UseAbilityEvent} from '../../../lib/abilities/events/index.js';
import {cast, hasValue} from '../../../lib/util/functions.js';
import {prompt, sayAt} from '../../../lib/communication/broadcast.js';

import type Ability from '../../../lib/abilities/ability.js';
import type Channel from '../../../lib/communication/channels/channel.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';
import type {CommandLoopPayload} from '../lib/events/index.js';
import type {PlayerMovePayload} from '../../../lib/players/events/index.js';

const handleChannelError = (err: unknown, player: Player, channel: Channel): void => {
    if (err instanceof NoPartyError) {
        sayAt(player, "You aren't in a group.");
    }
    else if (err instanceof NoRecipientError) {
        sayAt(player, 'Send the message to whom?');
    }
    else if (err instanceof NoMessageError) {
        sayAt(player, `\nChannel: ${channel.name}`);
        sayAt(player, `Syntax: ${channel.getUsage()}`);

        if (hasValue(channel.description)) {
            sayAt(player, channel.description);
        }
    }
    else if (err instanceof RestrictedCommandError) {
        throw err;
    }
};

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it
 */
export const evt: StreamEventListenerFactory<CommandLoopPayload> = {
    name: CommandLoopEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<CommandLoopPayload> => (
        stream: TransportStream<EventEmitter>,
        {player}: CommandLoopPayload
    ): void => {
        stream.socket.once('data', (buf: Buffer) => {
            const loop = (): void => {
                stream.dispatch(new CommandLoopEvent({player}));
            };

            const data = buf.toString().trim();

            if (data.length === 0) {
                loop();

                return;
            }

            player.setMeta('lastCommandTime', Date.now());

            try {
                const result = CommandParser.parse(state, data, player);

                if (!hasValue(result)) {
                    throw new Error('Could not parse command');
                }

                switch (result.type) {
                    case CommandType.MOVEMENT:
                        player.dispatch(new PlayerMoveEvent(cast<PlayerMovePayload>(result.payload)));

                        break;

                    case CommandType.COMMAND: {
                        if (!hasValue(result.command)) {
                            throw new Error('Something weird happened. I dunno what');
                        }

                        const {requiredRole = PlayerRole.PLAYER} = result.command;

                        if (requiredRole > player.role) {
                            throw new RestrictedCommandError();
                        }

                        // commands have no lag and are not queued, just immediately execute them
                        result.command.execute(result.args, player, result.originalCommand);

                        break;
                    }

                    case CommandType.CHANNEL: {
                        const channel = cast<Channel>(result.payload?.channel);

                        // channels have no lag and are not queued, just immediately execute them
                        try {
                            if (!hasValue(channel)) {
                                throw new UnknownChannelError();
                            }

                            if (
                                hasValue(channel.minRequiredRole)
                                && channel.minRequiredRole > player.role
                            ) {
                                throw new RestrictedCommandError();
                            }

                            channel.send(state, player, result.args);
                        }
                        catch (err: unknown) {
                            handleChannelError(err, player, channel);
                        }

                        break;
                    }

                    case CommandType.SKILL: {
                        const skill = cast<Ability>(result.payload?.skill);

                        const lag = skill.lag >= 0
                            ? skill.lag
                            : state.config.get<number>('skillLag', 1000)!;

                        /*
                         * See bundles/ranvier-player-events/player-events.js
                         * commandQueued and updateTick for when these actually
                         * get executed
                         */
                        player.queueCommand(
                            {
                                execute: () => player.dispatch(new UseAbilityEvent({
                                    args: result.args,
                                    ability: skill,
                                })),
                                label: data,
                                lag: 0,
                            },
                            lag
                        );

                        break;
                    }

                    /* no default */
                }
            }
            catch (err: unknown) {
                if (err instanceof InvalidCommandError) {
                    // check to see if room has a matching context-specific command
                    const roomCommands = player.room?.getMeta<string[]>('commands') ?? [];
                    const [commandName, ...args] = data.split(' ');

                    if (roomCommands.includes(commandName)) {
                        player.room!.dispatch(new RoomCommandEvent({
                            args: args.join(' '),
                            name: commandName,
                            player: player,
                        }));
                    }
                    else {
                        sayAt(player, 'Huh?');
                        Logger.warn(`WARNING: Player tried non-existent command '${data}'`);
                    }
                }
                else if (err instanceof RestrictedCommandError) {
                    sayAt(player, "You can't do that.");
                }
                else {
                    Logger.error(cast<Error>(err).message);
                }
            }

            prompt(player);

            loop();
        });
    },
};

export default evt;
