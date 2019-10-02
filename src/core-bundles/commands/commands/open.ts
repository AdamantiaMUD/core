import ArgParser from '../../../lib/commands/arg-parser';
import CommandParser from '../../../lib/commands/command-parser';
import Broadcast from '../../../lib/communication/broadcast';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import Room from '../../../lib/locations/room';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

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

            return;
        }

        case 'lock': {
            if (door.locked) {
                sayAt(player, 'The door is already locked.');

                return;
            }

            if (!door.lockedBy) {
                sayAt(player, "You can't lock that door.");

                return;
            }

            const playerKey = player.hasItem(door.lockedBy);

            if (!playerKey) {
                sayAt(player, "You don't have the key.");

                return;
            }

            doorRoom.lockDoor(targetRoom);

            sayAt(player, '*Click* The door locks.');

            return;
        }

        case 'unlock': {
            if (!door.locked) {
                sayAt(player, 'It is already unlocked.');

                return;
            }

            if (door.lockedBy) {
                if (player.hasItem(door.lockedBy)) {
                    sayAt(player, '*Click* The door unlocks.');

                    doorRoom.unlockDoor(targetRoom);

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

    if (!item.closeable) {
        sayAt(player, `${itemName} is not a container.`);

        return;
    }

    switch (action) {
        case 'open': {
            if (item.locked) {
                sayAt(player, `${itemName} is locked.`);

                return;
            }

            if (item.closed) {
                sayAt(player, `You open ${itemName}.`);

                item.open();

                return;
            }

            sayAt(player, `${itemName} is already open, you can't open it any farther.`);

            return;
        }

        case 'close': {
            if (item.locked || item.closed) {
                sayAt(player, "It's already closed.");

                return;
            }

            sayAt(player, `You close ${itemName}.`);

            item.close();

            return;
        }

        case 'lock': {
            if (item.locked) {
                sayAt(player, "It's already locked.");

                return;
            }

            if (!item.lockedBy) {
                sayAt(player, `You can't lock ${itemName}.`);

                return;
            }

            const playerKey = player.hasItem(item.lockedBy);

            if (playerKey) {
                sayAt(player, `*click* You lock ${itemName}.`);

                item.lock();

                return;
            }

            sayAt(player, "The item is locked and you don't have the key.");

            return;
        }

        case 'unlock': {
            if (!item.locked) {
                sayAt(player, `${itemName} isn't locked...`);

                return;
            }

            if (!item.closed) {
                sayAt(player, `${itemName} isn't closed...`);

                return;
            }

            if (item.lockedBy) {
                const playerKey = player.hasItem(item.lockedBy);

                if (playerKey) {
                    /* eslint-disable-next-line max-len */
                    sayAt(player, `*click* You unlock ${itemName} with ${ItemUtil.display(playerKey)}.`);

                    item.unlock();

                    return;
                }

                sayAt(player, "The item is locked and you don't have the key.");

                return;
            }

            sayAt(player, `*Click* You unlock ${itemName}.`);

            item.unlock();

            /* eslint-disable-next-line no-useless-return */
            return;
        }

        /* no default */
    }
};

export const cmd: CommandDefinitionFactory = {
    name: 'open',
    aliases: ['close', 'lock', 'unlock'],
    /* eslint-disable-next-line max-len */
    usage: '[open/close/lock/unlock] <item> / [open/close/lock/unlock] <door direction>/ [open/close/lock/unlock] <door direction>',
    command: state => (args, player, arg0) => {
        const action = arg0.toString().toLowerCase();

        if (!args || !args.length) {
            sayAt(player, `What do you want to ${action}?`);

            return;
        }

        if (!player.room) {
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

        if (roomExit) {
            const roomExitRoom = state.RoomManager.getRoom(roomExit.roomId);
            let doorRoom = player.room,
                targetRoom = roomExitRoom,
                door = doorRoom.getDoor(targetRoom);

            if (!door) {
                doorRoom = roomExitRoom;
                targetRoom = player.room;
                door = doorRoom.getDoor(targetRoom);
            }

            if (door) {
                handleDoor(player, doorRoom, targetRoom, door, action);

                return;
            }
        }

        const item = ArgParser.parseDot(args, [...player.inventory, ...player.room.items]);

        if (item) {
            handleItem(player, item, action);

            return;
        }

        sayAt(player, `You don't see ${args} here.`);
    },
};

export default cmd;
