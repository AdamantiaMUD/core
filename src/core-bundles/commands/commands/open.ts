import ArgParser from '../../../lib/commands/arg-parser.js';
import CommandParser from '../../../lib/commands/command-parser.js';
import ItemUtil from '../../../lib/util/items.js';
import { hasValue } from '../../../lib/util/functions.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type Door from '../../../lib/locations/door.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Item from '../../../lib/equipment/item.js';
import type Player from '../../../lib/players/player.js';
import type Room from '../../../lib/locations/room.js';

const handleDoor = (
    player: Player,
    doorRoom: Room,
    targetRoom: Room,
    door: Door,
    action: string
): void => {
    switch (action) {
        case 'open': {
            if (door.locked) {
                sayAt(player, 'The door is locked.');

                return;
            }

            if (door.closed) {
                sayAt(player, 'The door swings open.');

                doorRoom.openDoor(targetRoom);

                if (!door.oneWay) {
                    targetRoom.openDoor(doorRoom);
                }

                return;
            }

            sayAt(player, 'The door is not closed.');

            return;
        }

        case 'close': {
            if (door.locked || door.closed) {
                sayAt(player, 'The door is already closed.');

                return;
            }

            sayAt(player, 'The door swings closed.');

            doorRoom.closeDoor(targetRoom);

            if (!door.oneWay) {
                targetRoom.closeDoor(doorRoom);
            }

            return;
        }

        case 'lock': {
            if (door.locked) {
                sayAt(player, 'The door is already locked.');

                return;
            }

            if (!hasValue(door.lockedBy)) {
                sayAt(player, "You can't lock that door.");

                return;
            }

            if (!player.hasItem(door.lockedBy)) {
                sayAt(player, "You don't have the key.");

                return;
            }

            doorRoom.lockDoor(targetRoom);

            if (!door.oneWay) {
                targetRoom.lockDoor(doorRoom);
            }

            sayAt(player, '*Click* The door locks.');

            return;
        }

        case 'unlock': {
            if (!door.locked) {
                sayAt(player, 'It is already unlocked.');

                return;
            }

            if (hasValue(door.lockedBy)) {
                if (player.hasItem(door.lockedBy)) {
                    sayAt(player, '*Click* The door unlocks.');

                    doorRoom.unlockDoor(targetRoom);

                    if (!door.oneWay) {
                        targetRoom.unlockDoor(doorRoom);
                    }

                    return;
                }

                sayAt(player, 'The door can only be unlocked with a key.');

                return;
            }

            sayAt(player, "You can't unlock that door.");

            /* eslint-disable-next-line no-useless-return */
            return;
        }

        /* no default */
    }
};

const handleItem = (player: Player, item: Item, action: string): void => {
    const itemName = ItemUtil.display(item);

    if (!item.getMeta<boolean>('closeable')) {
        sayAt(player, `${itemName} is not a container.`);

        return;
    }

    switch (action) {
        case 'open': {
            if (item.getMeta<boolean>('locked')) {
                sayAt(player, `${itemName} is locked.`);

                return;
            }

            if (item.getMeta<boolean>('closed')) {
                sayAt(player, `You open ${itemName}.`);

                item.setMeta('closed', false);

                return;
            }

            sayAt(
                player,
                `${itemName} is already open, you can't open it any farther.`
            );

            return;
        }

        case 'close': {
            if (
                item.getMeta<boolean>('locked') ||
                item.getMeta<boolean>('closed')
            ) {
                sayAt(player, "It's already closed.");

                return;
            }

            sayAt(player, `You close ${itemName}.`);

            item.setMeta('closed', true);

            return;
        }

        case 'lock': {
            if (item.getMeta<boolean>('locked')) {
                sayAt(player, "It's already locked.");

                return;
            }

            const key = item.getMeta<string>('lockedBy');

            if (!hasValue(key)) {
                sayAt(player, `You can't lock ${itemName}.`);

                return;
            }

            if (player.hasItem(key)) {
                sayAt(player, `*click* You lock ${itemName}.`);

                item.setMeta('locked', true);

                return;
            }

            sayAt(player, "The item is locked and you don't have the key.");

            return;
        }

        case 'unlock': {
            if (!item.getMeta<boolean>('locked')) {
                sayAt(player, `${itemName} isn't locked...`);

                return;
            }

            if (!item.getMeta<boolean>('closed')) {
                sayAt(player, `${itemName} isn't closed...`);

                return;
            }

            const keyRef = item.getMeta<string>('lockedBy');

            if (hasValue(keyRef)) {
                if (player.hasItem(keyRef)) {
                    const key = player.getItem(keyRef);

                    sayAt(
                        player,
                        `*click* You unlock ${itemName} with ${ItemUtil.display(key!)}.`
                    );

                    item.setMeta('locked', false);

                    return;
                }

                sayAt(player, "The item is locked and you don't have the key.");

                return;
            }

            sayAt(player, `*Click* You unlock ${itemName}.`);

            item.setMeta('locked', false);

            /* eslint-disable-next-line no-useless-return */
            return;
        }

        /* no default */
    }
};

export const cmd: CommandDefinitionFactory = {
    name: 'open',
    aliases: ['close', 'lock', 'unlock'],
    usage: '[open/close/lock/unlock] <item> / [open/close/lock/unlock] <door direction>/ [open/close/lock/unlock] <door direction>',
    command:
        (state: GameStateData): CommandExecutable =>
        (rawArgs: string | null, player: Player, arg0: string): void => {
            const action = arg0.toString().toLowerCase();
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, `What do you want to ${action}?`);

                return;
            }

            if (!hasValue(player.room)) {
                sayAt(player, 'You are floating in the nether.');

                return;
            }

            const parts = args.split(' ');

            let exitDirection = parts[0];

            if (parts[0] === 'door' && parts.length >= 2) {
                // Exit is in second parameter
                exitDirection = parts[1];
            }

            const roomExit = CommandParser.canGo(player, exitDirection);

            if (hasValue(roomExit)) {
                const roomExitRoom = state.roomManager.getRoom(roomExit.roomId);

                let doorRoom = player.room,
                    targetRoom = roomExitRoom,
                    door = doorRoom.getDoor(targetRoom);

                if (!hasValue(door) && hasValue(roomExitRoom)) {
                    doorRoom = roomExitRoom;
                    targetRoom = player.room;

                    door = doorRoom.getDoor(targetRoom);
                }

                if (hasValue(door) && hasValue(targetRoom)) {
                    handleDoor(player, doorRoom, targetRoom, door, action);

                    return;
                }
            }

            const item = ArgParser.parseDot(args, [
                ...player.inventory.items,
                ...player.room.items,
            ]);

            if (hasValue(item)) {
                handleItem(player, item, action);

                return;
            }

            sayAt(player, `You don't see ${args} here.`);
        },
};

export default cmd;
