import ArgParser from '../../../lib/commands/arg-parser';
import ItemUtil from '../../../lib/util/items';
import Item from '../../../lib/equipment/item';
import ItemType from '../../../lib/equipment/item-type';
import Logger from '../../../lib/util/logger';
import Player from '../../../lib/players/player';
import {at, sayAt} from '../../../lib/communication/broadcast';
import {hasValue} from '../../../lib/util/functions';
import {humanize} from '../../../lib/util/time';

import type CharacterInterface from '../../../lib/characters/character-interface';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameEntityInterface from '../../../lib/entities/game-entity-interface';
import type GameStateData from '../../../lib/game-state-data';
import type Npc from '../../../lib/mobs/npc';
import type {RoomExitDefinition} from '../../../lib/locations/room';
import type {UsableConfig} from '../../behaviors/behaviors/item/usable';

const exitMap = new Map<string, string>();

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

const getEntity = (search: string, player: Player): GameEntityInterface | null => {
    const room = player.room!;

    let entity: GameEntityInterface = ArgParser.parseDot(search, Array.from(room.items)) as GameEntityInterface;

    entity ??= ArgParser.parseDot(search, Array.from(room.players)) as GameEntityInterface;
    entity ??= ArgParser.parseDot(search, Array.from(room.npcs)) as GameEntityInterface;
    entity ??= ArgParser.parseDot(search, Array.from(player.inventory.items)) as GameEntityInterface;

    return entity;
};

const getCombatantsDisplay = (entity: CharacterInterface): string => {
    const combatantsList = [...entity.combat.combatants.values()]
        .map((combatant: CharacterInterface) => combatant.name);

    return `, <red>fighting </red>${combatantsList.join('<red>,</red> ')}`;
};

const lookRoom = (state: GameStateData, player: Player): void => {
    if (!hasValue(player.room)) {
        sayAt(player, 'You are floating in the nether, there is nothing to look at.');

        return;
    }

    const room = player.room;

    sayAt(player, `<b>${room.title}</b>`);

    if (!player.getMeta<boolean>('config.brief')) {
        sayAt(player, `    ${room.description}`, 80);
    }

    at(player, '<green><b>Exits</green></b>: ');

    const exits = room.getExits();
    const foundExits: RoomExitDefinition[] = [];

    // prioritize explicit over inferred exits with the same name
    for (const exit of exits) {
        if (!hasValue(foundExits.find((fex: RoomExitDefinition) => fex.direction === exit.direction))) {
            foundExits.push(exit);
        }
    }

    const exitList: string = foundExits.map((exit: RoomExitDefinition): string => {
        const exitRoom = state.roomManager.getRoom(exit.roomId);
        const door = room.getDoor(exitRoom) ?? exitRoom.getDoor(room);

        if (hasValue(door) && (door.locked || door.closed)) {
            return `#${exitMap.get(exit.direction)!}`;
        }

        return `-${exitMap.get(exit.direction)!}`;
    }).join(' ');

    if (foundExits.length > 0) {
        at(player, exitList);
    }
    else {
        at(player, 'none');
    }

    sayAt(player, '');

    // show all the items in the rom
    room.items.forEach((item: Item) => {
        const desc = item.roomDesc.length > 0 ? item.roomDesc : item.description;

        if (item.hasBehavior('resource')) {
            sayAt(player, `[${ItemUtil.qualityColorize(item, 'Resource')}] <magenta>${desc}</magenta>`);
        }
        else {
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

        if (hasValue(npc.quests)) {
            hasNewQuest = hasValue(npc.quests
                .find((questRef: string) => state.questFactory.canStart(player, questRef)));

            hasReadyQuest = hasValue(npc.quests
                .find((questRef: string) => player.questTracker.isActive(questRef)
                    && player.questTracker.get(questRef)!.getProgress().percent >= 100));

            hasActiveQuest = hasValue(npc.quests.find((questRef: string) => player.questTracker.isActive(questRef)
                    && player.questTracker.get(questRef)!.getProgress().percent < 100));

            let questString = '';

            if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
                questString += hasNewQuest ? '[<b><yellow>!</yellow></b>]' : '';
                questString += hasActiveQuest ? '[<b><yellow>%</yellow></b>]' : '';
                questString += hasReadyQuest ? '[<b><yellow>?</yellow></b>]' : '';

                at(player, `${questString} `);
            }
        }

        let combatantsDisplay = '';

        if (npc.combat.isFighting()) {
            combatantsDisplay = getCombatantsDisplay(npc);
        }

        // color NPC label by difficulty
        let npcLabel: string;

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

        const desc = npc.roomDesc.length > 0 ? npc.roomDesc : npc.description;

        sayAt(player, `[${npcLabel}] ${desc}${combatantsDisplay}`);
    });

    // show all players
    room.players.forEach((otherPlayer: Player) => {
        if (otherPlayer === player) {
            return;
        }

        let combatantsDisplay = '';

        if (otherPlayer.combat.isFighting()) {
            combatantsDisplay = getCombatantsDisplay(otherPlayer);
        }

        sayAt(player, `[Player] ${otherPlayer.name}${combatantsDisplay}`);
    });
};

const lookEntity = (state: GameStateData, player: Player, rawArgs: string): void => {
    const args = rawArgs.split(' ')
        .filter((arg: string) => arg !== 'in');

    const entity: GameEntityInterface | null = getEntity(args[0], player);

    if (!hasValue(entity)) {
        sayAt(player, "You don't see anything like that here.");

        return;
    }

    if (entity instanceof Player) {
        // @TODO: Show player equipment
        sayAt(player, `You see fellow player ${entity.name}.`);

        return;
    }

    sayAt(player, `You look at ${entity.name}\r\n`, 80);
    sayAt(player, entity.description, 80);

    const decayTime = entity.getMeta<number>('time-until-decay');

    if (hasValue(decayTime)) {
        sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(decayTime)}.`);
    }

    if (entity instanceof Item) {
        const usable = entity.getBehavior('usable') as UsableConfig;

        if (hasValue(usable)) {
            if (hasValue(usable.spell)) {
                const useSpell = state.spellManager.get(usable.spell);

                if (hasValue(useSpell)) {
                    useSpell.options = usable.options ?? {};

                    sayAt(player, useSpell.info(useSpell, player));
                }
            }

            if (hasValue(usable.effect) && hasValue(usable.config?.description)) {
                sayAt(player, usable.config!.description as string);
            }

            if (hasValue(usable.charges)) {
                sayAt(player, `There are ${usable.charges} charges remaining.`);
            }
        }

        switch (entity.type) {
            case ItemType.WEAPON:
            case ItemType.ARMOR:
                sayAt(player, ItemUtil.renderItem(state, entity, player));

                break;

            case ItemType.CONTAINER:
                if (!hasValue(entity.inventory) || entity.inventory.size === 0) {
                    sayAt(player, `${entity.name} is empty.`);

                    return;
                }

                if (entity.getMeta<boolean>('closed')) {
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
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (!hasValue(player.room)) {
            Logger.error(`${player.name} is in limbo.`);

            sayAt(player, 'You are in a deep, dark void.');

            return;
        }

        if (args.length > 0) {
            lookEntity(state, player, args);
        }
        else {
            lookRoom(state, player);
        }
    },
};

export default cmd;
