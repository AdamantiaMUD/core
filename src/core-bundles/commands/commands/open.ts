import ArgParser from '../../../lib/commands/arg-parser';
import CommandParser from '../../../lib/commands/command-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Item from '../../../lib/equipment/item';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import Room, {Door} from '../../../lib/locations/room';
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

            if (!door.lockedBy) {
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

            if (door.lockedBy) {
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

    if (!item.getMeta('closeable')) {
        sayAt(player, `${itemName} is not a container.`);

        return;
    }

    switch (action) {
        case 'open': {
            if (item.getMeta('locked')) {
                sayAt(player, `${itemName} is locked.`);

                return;
            }

            if (item.getMeta('closed')) {
                sayAt(player, `You open ${itemName}.`);

                item.setMeta('closed', false);

                return;
            }

            sayAt(player, `${itemName} is already open, you can't open it any farther.`);

            return;
        }

        case 'close': {
            if (item.getMeta('locked') || item.getMeta('closed')) {
                sayAt(player, "It's already closed.");

                return;
            }

            sayAt(player, `You close ${itemName}.`);

            item.setMeta('closed', true);

            return;
        }

        case 'lock': {
            if (item.getMeta('locked')) {
                sayAt(player, "It's already locked.");

                return;
            }

            if (!item.getMeta('lockedBy')) {
                sayAt(player, `You can't lock ${itemName}.`);

                return;
            }

            if (player.hasItem(item.getMeta('lockedBy'))) {
                sayAt(player, `*click* You lock ${itemName}.`);

                item.setMeta('locked', true);

                return;
            }

            sayAt(player, "The item is locked and you don't have the key.");

            return;
        }

        case 'unlock': {
            if (!item.getMeta('locked')) {
                sayAt(player, `${itemName} isn't locked...`);

                return;
            }

            if (!item.getMeta('closed')) {
                sayAt(player, `${itemName} isn't closed...`);

                return;
            }

            if (item.getMeta('lockedBy')) {
                if (player.hasItem(item.getMeta('lockedBy'))) {
                    const key = player.getItem(item.getMeta('lockedBy'));

                    /* eslint-disable-next-line max-len */
                    sayAt(player, `*click* You unlock ${itemName} with ${ItemUtil.display(key)}.`);

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
            const roomExitRoom = state.roomManager.getRoom(roomExit.roomId);
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

        const item = ArgParser.parseDot(args, [...player.inventory.items, ...player.room.items]);

        if (item) {
            handleItem(player, item, action);

            return;
        }

        sayAt(player, `You don't see ${args} here.`);
    },
};

export default cmd;
