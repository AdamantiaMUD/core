import ArgParser from '../../../lib/commands/arg-parser';
import Command from '../../../lib/commands/command';
import CommandManager from '../../../lib/commands/command-manager';
import {QuestProgressEvent} from '../../../lib/quests/events';
import {
    at,
    center,
    indent,
    line,
    progress,
    sayAt,
    wrap,
} from '../../../lib/communication/broadcast';
import {hasValue} from '../../../lib/util/functions';

import type CommandDefinition from '../../../lib/commands/command-definition';
import type CommandDefinitionBuilder from '../../../lib/commands/command-definition-builder';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type GameStateData from '../../../lib/game-state-data';
import type Npc from '../../../lib/mobs/npc';
import type Player from '../../../lib/players/player';
import type Room from '../../../lib/locations/room';

const isPresent = (
    npcRef: string,
    room: Room
): boolean => hasValue([...room.npcs].find((npc: Npc) => npc.entityReference === npcRef));

const getAvailableQuests = (state: GameStateData, player: Player, npc: Npc): string[] => npc.quests
    .filter((ref: string) => state.questFactory.canStart(player, ref) || player.questTracker.isActive(ref));

const listLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'list',
    command: (args: string, player: Player): void => {
        const options = args.split(' ');

        if (options.length === 0) {
            sayAt(player, 'List quests from whom? quest list <npc>');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(player, "You're floating in the ether. There isn't anyone here to give you a quest!");

            return;
        }

        const search = options[0];
        const npc = ArgParser.parseDot(search, Array.from(player.room.npcs));

        if (!hasValue(npc)) {
            sayAt(player, `No quest giver [${search}] found.`);

            return;
        }

        if (npc.quests.length === 0) {
            sayAt(player, `${npc.name} has no quests.`);

            return;
        }

        const availableQuests = getAvailableQuests(state, player, npc);

        if (availableQuests.length === 0) {
            sayAt(player, `${npc.name} has no quests.`);

            return;
        }

        let displayIndex = 0;

        for (const ref of availableQuests) {
            const quest = state.questFactory.get(ref);

            if (state.questFactory.canStart(player, ref)) {
                sayAt(player, `[<b><yellow>!</yellow></b>] - ${displayIndex}. ${quest!.config.title}`);
            }
            else if (player.questTracker.isActive(ref)) {
                const activeQuest = player.questTracker.get(ref);

                const symbol = activeQuest!.getProgress().percent >= 100 ? '?' : '%';

                sayAt(player, `[<b><yellow>${symbol}</yellow></b>] - ${displayIndex}. ${activeQuest!.config.title}`);
            }

            displayIndex += 1;
        }
    },
});

const startLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'start',
    aliases: ['accept'],
    command: (args: string, player: Player): void => {
        const options = args.split(' ');

        if (options.length < 2) {
            sayAt(player, "Start which quest from whom? 'quest start <npc> <number>'");

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(player, "You're floating in the ether. There isn't anyone here to give you a quest!");

            return;
        }

        const search: string = options[0];
        const questIndex: number = parseInt(options[1], 10);

        const npc = ArgParser.parseDot(search, Array.from(player.room.npcs));

        if (!hasValue(npc)) {
            sayAt(player, `No quest giver [${search}] found.`);

            return;
        }

        if (npc.quests.length === 0) {
            sayAt(player, `${npc.name} has no quests.`);

            return;
        }

        if (isNaN(questIndex) || questIndex < 0 || questIndex > npc.quests.length) {
            sayAt(player, `Invalid quest, use 'quest list ${search}' to see their quests.`);

            return;
        }

        const availableQuests = getAvailableQuests(state, player, npc);

        const targetQuest = availableQuests[questIndex - 1];

        if (player.questTracker.isActive(targetQuest)) {
            sayAt(player, "You've already started that quest. Use 'quest log' to see your active quests.");

            return;
        }

        const quest = state.questFactory.create(state, targetQuest, player);

        player.questTracker.start(quest);
        player.save();
    },
});

const logLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'log',
    command: (args: string, player: Player): void => {
        const active = [...player.questTracker.active];

        if (active.length === 0) {
            sayAt(player, 'You have no active quests.');

            return;
        }

        let displayIndex = 1;

        for (const [, quest] of active) {
            const questProgress = quest.getProgress();

            at(player, `<b><yellow>${displayIndex}</yellow></b>: `);
            sayAt(player, `${progress(60, questProgress.percent, 'yellow')} ${questProgress.percent}%`);
            sayAt(player, indent(`<b><yellow>${quest.getProgress().display}</yellow></b>`, 2));

            if (hasValue(quest.config.npc)) {
                const npc = state.mobFactory.getDefinition(quest.config.npc);

                if (hasValue(npc)) {
                    sayAt(player, `  <b><yellow>Questor: ${npc.name}</yellow></b>`);
                }
            }

            sayAt(player, `  ${line(78)}`);
            sayAt(
                player,
                indent(
                    wrap(`<b><yellow>${quest.config.description}</yellow></b>`, 78),
                    2
                )
            );

            if (quest.config.rewards.length > 0) {
                sayAt(player);
                sayAt(player, `<b><yellow>${center(80, 'Rewards')}</yellow></b>`);
                sayAt(player, `<b><yellow>${center(80, '-------')}</yellow></b>`);

                for (const reward of quest.config.rewards) {
                    const rewardClass = state.questRewardManager.get(reward.type);

                    if (hasValue(rewardClass)) {
                        sayAt(player, `  ${rewardClass.display(state, quest, player, reward.config)}`);
                    }
                }
            }

            sayAt(player, `  ${line(78)}`);

            displayIndex += 1;
        }
    },
});

const completeLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'complete',
    command: (args: string, player: Player): void => {
        const options = args.split(' ');
        const active = [...player.questTracker.active];
        let targetQuest = parseInt(options[0], 10);

        targetQuest = isNaN(targetQuest) ? -1 : targetQuest - 1;

        if (!hasValue(active[targetQuest])) {
            sayAt(player, "Invalid quest, use 'quest log' to see your active quests.");

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(player, "You're floating in the ether. There isn't anyone here to give you a quest!");

            return;
        }

        const [, quest] = active[targetQuest];

        if (quest.getProgress().percent < 100) {
            sayAt(player, `${quest.config.title} isn't complete yet.`);
            quest.dispatch(new QuestProgressEvent({progress: quest.getProgress()}));

            return;
        }

        if (hasValue(quest.config.npc) && !isPresent(quest.config.npc, player.room)) {
            const npc = state.mobFactory.getDefinition(quest.config.npc);

            if (hasValue(npc)) {
                sayAt(player, `The questor [${npc.name}] is not in this room.`);
            }
            else {
                sayAt(player, `The questor is not in this room.`);
            }

            return;
        }

        quest.complete();
        player.save();
    },
});

export const cmd: CommandDefinitionFactory = {
    name: 'quest',
    usage: 'quest <log/list/complete/start> [npc] [number]',
    command: (state: GameStateData) => {
        const subcommands = new CommandManager();

        subcommands.add(new Command('bundle-example-quests', 'list', listLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'start', startLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'log', logLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'complete', completeLoader(state), ''));

        return (args: string, player: Player): void => {
            if (args.length === 0) {
                sayAt(player, "Missing command. See 'help quest'");

                return;
            }

            const [command, ...options] = args.split(' ');

            const subcommand = subcommands.find(command);

            if (!hasValue(subcommand)) {
                sayAt(player, "Invalid command. See 'help quest'");

                return;
            }

            subcommand.execute(options.join(' '), player);
        };
    },
};

export default cmd;
