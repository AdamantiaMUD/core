import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Command, {
    CommandDefinition,
    CommandDefinitionBuilder, CommandDefinitionFactory
} from '../../../lib/commands/command';
import CommandManager from '../../../lib/commands/command-manager';
import GameState from '../../../lib/game-state';
import Npc from '../../../lib/mobs/npc';
import Player from '../../../lib/players/player';

const {
    /* eslint-disable-next-line id-length */
    at,
    center,
    indent,
    line,
    progress,
    sayAt,
    wrap,
} = Broadcast;

const getAvailableQuests = (
    state: GameState,
    player: Player,
    npc: Npc
): string[] => npc.quests
    .filter(ref => state.questFactory.canStart(player, ref) || player.questTracker.isActive(ref));

const listLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'list',
    command: (args: string, player: Player) => {
        const options = args.split(' ');

        if (!options.length) {
            sayAt(player, 'List quests from whom? quest list <npc>');

            return;
        }

        const search = options[0];
        const npc = ArgParser.parseDot(search, player.room.npcs);

        if (!npc) {
            sayAt(player, `No quest giver [${search}] found.`);

            return;
        }

        if (!npc.quests) {
            sayAt(player, `${npc.name} has no quests.`);

            return;
        }

        const availableQuests = getAvailableQuests(state, player, npc);

        if (!availableQuests.length) {
            sayAt(player, `${npc.name} has no quests.`);

            return;
        }

        for (const i in availableQuests) {
            if (Object.prototype.hasOwnProperty.call(availableQuests, i)) {
                const ref = availableQuests[i];
                const displayIndex = parseInt(i, 10) + 1;
                const quest = state.questFactory.get(ref);

                if (state.questFactory.canStart(player, ref)) {
                    /* eslint-disable-next-line max-len */
                    sayAt(player, `[<b><yellow>!</yellow></b>] - ${displayIndex}. ${quest.config.title}`);
                }
                else if (player.questTracker.isActive(ref)) {
                    const activeQuest = player.questTracker.get(ref);

                    const symbol = activeQuest.getProgress().percent >= 100 ? '?' : '%';

                    /* eslint-disable-next-line max-len */
                    sayAt(player, `[<b><yellow>${symbol}</yellow></b>] - ${displayIndex}. ${activeQuest.config.title}`);
                }
            }
        }
    },
});

const startLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'start',
    aliases: ['accept'],
    command: (args: string, player: Player) => {
        const options = args.split(' ');

        if (options.length < 2) {
            sayAt(player, "Start which quest from whom? 'quest start <npc> <number>'");

            return;
        }

        const search: string = options[0];
        const questIndex: number = parseInt(options[1], 10);

        const npc = ArgParser.parseDot(search, player.room.npcs);

        if (!npc) {
            sayAt(player, `No quest giver [${search}] found.`);

            return;
        }

        if (!npc.quests || !npc.quests.length) {
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
            /* eslint-disable-next-line max-len */
            sayAt(player, "You've already started that quest. Use 'quest log' to see your active quests.");

            return;
        }

        const quest = state.questFactory.create(state, targetQuest, player);

        player.questTracker.start(quest);
        player.save();
    },
});

const logLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'log',
    command: (args: string, player: Player) => {
        const active = [...player.questTracker.active];

        if (!active.length) {
            sayAt(player, 'You have no active quests.');

            return;
        }

        for (const i in active) {
            const [, quest] = active[i];
            const prog = quest.getProgress();

            at(player, `<b><yellow>${parseInt(i, 10) + 1}</yellow></b>: `);
            /* eslint-disable-next-line max-len */
            sayAt(player, `${progress(60, prog.percent, 'yellow')} ${prog.percent}%`);
            /* eslint-disable-next-line max-len */
            sayAt(player, indent(`<b><yellow>${quest.getProgress().display}</yellow></b>`, 2));

            if (quest.config.npc) {
                const npc = state.mobFactory.getDefinition(quest.config.npc);

                sayAt(player, `  <b><yellow>Questor: ${npc.name}</yellow></b>`);
            }

            sayAt(player, `  ${line(78)}`);
            sayAt(
                player,
                indent(
                    wrap(`<b><yellow>${quest.config.description}</yellow></b>`, 78),
                    2
                )
            );

            if (quest.config.rewards.length) {
                sayAt(player);
                sayAt(player, `<b><yellow>${center(80, 'Rewards')}</yellow></b>`);
                sayAt(player, `<b><yellow>${center(80, '-------')}</yellow></b>`);

                for (const reward of quest.config.rewards) {
                    const rewardClass = state.questRewardManager.get(reward.type);

                    sayAt(player, `  ${rewardClass.display(state, quest, reward.config, player)}`);
                }
            }

            sayAt(player, `  ${line(78)}`);
        }
    },
});

const completeLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'complete',
    command: (args: string, player: Player) => {
        const options = args.split(' ');
        const active = [...player.questTracker.active];
        let targetQuest = parseInt(options[0], 10);

        targetQuest = isNaN(targetQuest) ? -1 : targetQuest - 1;
        if (!active[targetQuest]) {
            sayAt(player, "Invalid quest, use 'quest log' to see your active quests.");

            return;
        }

        const [, quest] = active[targetQuest];

        if (quest.getProgress().percent < 100) {
            sayAt(player, `${quest.config.title} isn't complete yet.`);
            quest.emit('progress', quest.getProgress());

            return;
        }

        if (
            quest.config.npc
            && ![...player.room.npcs].find(npc => npc.entityReference === quest.config.npc)
        ) {
            const npc = state.mobFactory.getDefinition(quest.config.npc);

            sayAt(player, `The questor [${npc.name}] is not in this room.`);

            return;
        }

        quest.complete();
        player.save();
    },
});

export const cmd: CommandDefinitionFactory = {
    name: 'quest',
    usage: 'quest <log/list/complete/start> [npc] [number]',
    command: (state: GameState) => {
        const subcommands = new CommandManager();

        subcommands.add(new Command('bundle-example-quests', 'list', listLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'start', startLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'log', logLoader(state), ''));
        subcommands.add(new Command('bundle-example-quests', 'complete', completeLoader(state), ''));

        return (args: string, player: Player) => {
            if (!args.length) {
                sayAt(player, "Missing command. See 'help quest'");

                return;
            }

            const [command, ...options] = args.split(' ');

            const subcommand = subcommands.find(command);

            if (!subcommand) {
                sayAt(player, "Invalid command. See 'help quest'");

                return;
            }

            subcommand.execute(options.join(' '), player);
        };
    },
};

export default cmd;
