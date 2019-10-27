import Command from './command';
import CommandType from './command-type';
import GameState from '../game-state';
import Player from '../players/player';
import PlayerRole from '../players/player-role';
import SimpleMap from '../util/simple-map';
import {InvalidCommandError} from './command-errors';
import {RoomExitDefinition} from '../locations/room';

export interface ParsedCommand {
    args: string;
    command?: Command;
    originalCommand?: string;
    payload?: SimpleMap;
    requiredRole?: PlayerRole;
    type: CommandType;
}

/**
 * Interpreter.. you guessed it, interprets command input
 */
export class CommandParser {
    /**
     * Determine if a player can leave the current room to a given direction
     */
    public static canGo(player: Player, direction: string): RoomExitDefinition {
        if (!player.room) {
            return undefined;
        }

        const dir = CommandParser.checkDirection(player, direction);

        return player.room
            .getExits()
            .find(roomExit => roomExit.direction === dir);
    }

    public static checkDirection(player: Player, direction: string): string {
        const primaryDirections = [
            'north',
            'south',
            'east',
            'west',
            'up',
            'down',
        ];

        for (const dir of primaryDirections) {
            if (dir.indexOf(direction) === 0) {
                return dir;
            }
        }

        const secondaryDirections = [
            {abbr: 'ne', name: 'northeast'},
            {abbr: 'nw', name: 'northwest'},
            {abbr: 'se', name: 'southeast'},
            {abbr: 'sw', name: 'southwest'},
        ];

        for (const dir of secondaryDirections) {
            if (dir.abbr === direction || dir.name.indexOf(direction) === 0) {
                return dir.name;
            }
        }

        return null;
    }

    /**
     * Check command for partial match on primary directions, or exact match on
     * secondary name or abbreviation
     */
    public static checkMovement(player: Player, direction: string): string {
        const exit = CommandParser.checkDirection(player, direction);

        if (exit !== null) {
            return exit;
        }

        const otherExit = player.room
            .getExits()
            .find(roomExit => roomExit.direction === direction);

        return otherExit ? otherExit.direction : null;
    }

    /**
     * Parse a given string to find the resulting command/arguments
     */
    public static parse(state: GameState, raw: string, player: Player): ParsedCommand {
        const data = raw.trim();
        const parts = data.split(' ');
        const command = parts.shift().toLowerCase();

        if (!command.length) {
            throw new InvalidCommandError();
        }

        const args = parts.join(' ');

        /*
         * Kludge so that 'l' alone will always force a look,
         * instead of mixing it up with lock or list.
         * TODO: replace this a priority list
         */
        if (command === 'l') {
            return {
                type: CommandType.COMMAND,
                command: state.commandManager.get('look'),
                args: args,
                originalCommand: command,
            };
        }

        // Same with 'i' and inventory.
        if (command === 'i') {
            return {
                type: CommandType.COMMAND,
                command: state.commandManager.get('inventory'),
                args: args,
                originalCommand: command,
            };
        }

        // see if they matched a direction for a movement command
        const roomDirection = this.checkMovement(player, command);

        if (roomDirection) {
            const roomExit = this.canGo(player, roomDirection);

            return {
                type: CommandType.MOVEMENT,
                args: args,
                originalCommand: command,
                payload: {
                    roomExit: roomExit,
                },
            };
        }

        // see if they matched exactly a command
        if (state.commandManager.get(command)) {
            return {
                type: CommandType.COMMAND,
                command: state.commandManager.get(command),
                args: args,
                originalCommand: command,
            };
        }

        // see if they typed at least the beginning of a command and try to match
        const foundStart = state.commandManager.findWithAlias(command);

        if (foundStart) {
            return {
                type: CommandType.COMMAND,
                command: foundStart.command,
                args: args,
                originalCommand: foundStart.alias,
            };
        }

        // // check channels
        // const foundChannel = state.ChannelManager.find(command);
        //
        // if (foundChannel) {
        //     return {
        //         type: CommandType.CHANNEL,
        //         payload: {
        //             channel: foundChannel,
        //         },
        //         args: args,
        //     };
        // }

        // // finally check skills
        // const foundSkill = state.SkillManager.find(command);
        //
        // if (foundSkill) {
        //     return {
        //         type: CommandType.SKILL,
        //         payload: {
        //             skill: foundSkill
        //         },
        //         args: args,
        //     };
        // }

        throw new InvalidCommandError();
    }
}

export default CommandParser;
