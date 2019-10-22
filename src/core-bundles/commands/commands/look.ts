import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/entities/character';
import GameState from '../../../lib/game-state';
import ItemUtil from '../../../lib/util/items';
import Logger from '../../../lib/util/logger';
import Npc from '../../../lib/mobs/npc';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';
import {humanize} from '../../../lib/util/time';
import Item from '../../../lib/equipment/item';
import ItemType from '../../../lib/equipment/item-type';

/* eslint-disable-next-line id-length */
const {at, sayAt} = Broadcast;

const exitMap = new Map();

exitMap.set('east', 'E');
exitMap.set('west', 'W');
exitMap.set('south', 'S');
exitMap.set('north', 'N');
exitMap.set('up', 'U');
exitMap.set('down', 'D');
exitMap.set('southwest', 'SW');
exitMap.set('southeast', 'SE');
exitMap.set('northwest', 'NW');
exitMap.set('northeast', 'NE');

const getCombatantsDisplay = (entity: Character): string => {
    const combatantsList = [...entity.combat.combatants.values()]
        .map(combatant => combatant.name);

    return `, <red>fighting </red>${combatantsList.join('<red>,</red> ')}`;
};

const lookRoom = (state: GameState, player: Player): void => {
    const room = player.room;

    sayAt(player, `<b>${room.title}</b>`);

    if (!player.getMeta('config.brief')) {
        sayAt(player, `    ${room.description}`, 80);
    }

    at(player, '<green><b>Exits</green></b>: ');

    const exits = room.getExits();
    const foundExits = [];

    // prioritize explicit over inferred exits with the same name
    for (const exit of exits) {
        if (!foundExits.find(fex => fex.direction === exit.direction)) {
            foundExits.push(exit);
        }
    }

    at(player, foundExits.map(exit => {
        const exitRoom = state.roomManager.getRoom(exit.roomId);
        const door = room.getDoor(exitRoom) || exitRoom.getDoor(room);

        if (door && (door.locked || door.closed)) {
            return `#${exitMap.get(exit.direction)}`;
        }

        return `-${exitMap.get(exit.direction)}`;
    }).join(' '));

    if (!foundExits.length) {
        at(player, 'none');
    }

    sayAt(player, '');

    // show all the items in the rom
    room.items.forEach(item => {
        const desc = item.roomDesc ?? item.description;

        if (item.hasBehavior('resource')) {
            /* eslint-disable-next-line max-len */
            sayAt(player, `[${ItemUtil.qualityColorize(item, 'Resource')}] <magenta>${desc}</magenta>`);
        }
        else {
            /* eslint-disable-next-line max-len */
            sayAt(player, `[${ItemUtil.qualityColorize(item, 'Item')}] <magenta>${desc}</magenta>`);
        }
    });

    // show all npcs
    room.npcs.forEach((npc: Npc) => {
        /*
         * show quest state as [!], [%], [?] for available, in progress, ready
         * to complete respectively
         */
        let hasNewQuest = false,
            hasActiveQuest = false,
            hasReadyQuest = false;

        if (npc.quests) {
            hasNewQuest = npc.quests
                .find(questRef => state.questFactory.canStart(player, questRef)) !== undefined;

            hasReadyQuest = npc.quests
                .find(questRef => player.questTracker.isActive(questRef)
                    && player.questTracker.get(questRef).getProgress().percent >= 100) !== undefined;

            hasActiveQuest = npc.quests
                .find(questRef => player.questTracker.isActive(questRef)
                    && player.questTracker.get(questRef).getProgress().percent < 100) !== undefined;

            let questString = '';

            if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
                questString += hasNewQuest ? '[<b><yellow>!</yellow></b>]' : '';
                questString += hasActiveQuest ? '[<b><yellow>%</yellow></b>]' : '';
                questString += hasReadyQuest ? '[<b><yellow>?</yellow></b>]' : '';
                at(player, `${questString} `);
            }
        }

        let combatantsDisplay = '';

        if (npc.combat.isInCombat()) {
            combatantsDisplay = getCombatantsDisplay(npc);
        }

        // color NPC label by difficulty
        let npcLabel = 'NPC';

        switch (true) {
            case player.level - npc.level > 4:
                npcLabel = '<cyan>NPC</cyan>';
                break;

            case npc.level - player.level > 9:
                npcLabel = '<b><black>NPC</black></b>';
                break;

            case npc.level - player.level > 5:
                npcLabel = '<red>NPC</red>';
                break;

            case npc.level - player.level > 3:
                npcLabel = '<yellow>NPC</red>';
                break;

            default:
                npcLabel = '<green>NPC</green>';
                break;
        }

        const desc = npc.roomDesc || npc.description;

        sayAt(player, `[${npcLabel}] ${desc}${combatantsDisplay}`);
    });

    // show all players
    room.players.forEach(otherPlayer => {
        if (otherPlayer === player) {
            return;
        }

        let combatantsDisplay = '';

        if (otherPlayer.combat.isInCombat()) {
            combatantsDisplay = getCombatantsDisplay(otherPlayer);
        }

        sayAt(player, `[Player] ${otherPlayer.name}${combatantsDisplay}`);
    });
};

const lookEntity = (state: GameState, player: Player, rawArgs: string): void => {
    const room = player.room;

    const args = rawArgs.split(' ');
    let search = null;

    if (args.length > 1) {
        search = args[0] === 'in' ? args[1] : args[0];
    }
    else {
        search = args[0];
    }

    let entity = ArgParser.parseDot(search, room.items);

    entity = entity || ArgParser.parseDot(search, room.players);
    entity = entity || ArgParser.parseDot(search, room.npcs);
    entity = entity || ArgParser.parseDot(search, player.inventory);

    if (!entity) {
        sayAt(player, "You don't see anything like that here.");

        return;
    }

    if (entity instanceof Player) {
        // TODO: Show player equipment
        sayAt(player, `You see fellow player ${entity.name}.`);

        return;
    }

    sayAt(player, `You look at ${entity.name}\r\n`, 80);
    sayAt(player, entity.description, 80);

    if (entity.timeUntilDecay) {
        /* eslint-disable-next-line max-len */
        sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
    }

    const usable = entity.getBehavior('usable');

    if (usable) {
        if (usable.spell) {
            const useSpell = state.spellManager.get(usable.spell);

            if (useSpell) {
                useSpell.options = usable.options;
                sayAt(player, useSpell.info(useSpell, player));
            }
        }

        if (usable.effect && usable.config.description) {
            sayAt(player, usable.config.description);
        }

        if (usable.charges) {
            sayAt(player, `There are ${usable.charges} charges remaining.`);
        }
    }

    if (entity instanceof Item) {
        switch (entity.type) {
            case ItemType.WEAPON:
            case ItemType.ARMOR:
                sayAt(player, ItemUtil.renderItem(state, entity, player));

                break;

            case ItemType.CONTAINER:
                if (!entity.inventory || !entity.inventory.size) {
                    sayAt(player, `${entity.name} is empty.`);

                    return;
                }

                if (entity.getMeta('closed')) {
                    sayAt(player, 'It is closed.');

                    return;
                }

                at(player, 'Contents');
                if (isFinite(entity.inventory.getMax())) {
                    at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
                }

                sayAt(player, ':');

                for (const [, item] of entity.inventory.items) {
                    sayAt(player, `  ${ItemUtil.display(item)}`);
                }

                break;

            /* no default */
        }
    }
};

export const cmd: CommandDefinitionFactory = {
    name: 'look',
    usage: 'look [thing]',
    command: state => (args, player: Player) => {
        if (!player.room) {
            Logger.error(`${player.name} is in limbo.`);

            sayAt(player, 'You are in a deep, dark void.');

            return;
        }

        if (args) {
            lookEntity(state, player, args);

            return;
        }

        lookRoom(state, player);
    },
};

export default cmd;
