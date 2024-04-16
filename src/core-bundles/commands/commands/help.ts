import Logger from '../../../lib/common/logger.js';
import {
    center,
    line,
    sayAt,
    wrap,
} from '../../../lib/communication/broadcast.js';
import { cast, hasValue } from '../../../lib/util/functions.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Helpfile from '../../../lib/help/helpfile.js';
import type Player from '../../../lib/players/player.js';

const render = (state: GameStateData, helpFile: Helpfile): string => {
    const body = helpFile.body;
    const name = helpFile.name;

    const width = 80;
    const bar = `${line(width, '-', 'yellow')}\n`;

    let header = `${bar + center(width, name, 'white')}\n${bar}`;

    const formatHeaderItem = (item: string, value: string): string =>
        `${item}: ${value}\n\n`;

    if (hasValue(helpFile.command)) {
        const actualCommand = state.commandManager.get(helpFile.command)!;

        header += formatHeaderItem('Syntax', actualCommand.usage);

        if (actualCommand.aliases.length > 0) {
            header += formatHeaderItem(
                'Aliases',
                actualCommand.aliases.join(', ')
            );
        }
    } else if (hasValue(helpFile.channel)) {
        header += formatHeaderItem(
            'Syntax',
            state.channelManager.get(helpFile.channel)!.getUsage()
        );
    }

    let footer = bar;

    if (helpFile.related.length > 0) {
        footer = `${center(width, 'RELATED', 'yellow', '-')}\n`;
        const related = helpFile.related.join(', ');

        footer += `${center(width, related)}\n`;
        footer += bar;
    }

    return header + wrap(body, 80) + footer;
};

const searchHelpFiles = (
    rawArgs: string,
    player: Player,
    state: GameStateData
): void => {
    const args = rawArgs.split(' ').slice(1).join(' ');

    if (args.length === 0) {
        // `help search` syntax is included in `help help`
        state.commandManager.get('help')?.execute('help', player);

        return;
    }

    const results = state.helpManager.find(args);

    if (results.size === 0) {
        sayAt(player, 'Sorry, no results were found for your search.');

        return;
    }

    if (results.size === 1) {
        const [, helpFile] = [...results][0];

        sayAt(player, render(state, helpFile));

        return;
    }

    sayAt(
        player,
        '{yellow ---------------------------------------------------------------------------------}'
    );
    sayAt(player, '{white Search Results:}');
    sayAt(
        player,
        '{yellow ---------------------------------------------------------------------------------}'
    );

    for (const [name] of results) {
        sayAt(player, `{cyan ${name}}`);
    }
};

export const cmd: CommandDefinitionFactory = {
    name: 'help',
    usage: 'help [search] [topic keyword]',
    command:
        (state: GameStateData): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                // look at `help help` if they haven't specified a file
                state.commandManager.get('help')?.execute('help', player);

                return;
            }

            // `help search`
            if (args.startsWith('search')) {
                searchHelpFiles(args, player, state);

                return;
            }

            const helpfile = state.helpManager.get(args);

            if (!hasValue(helpfile)) {
                Logger.error(`MISSING-HELP: [${args}]`);

                sayAt(
                    player,
                    "Sorry, I couldn't find an entry for that topic."
                );

                return;
            }

            try {
                sayAt(player, render(state, helpfile));
            } catch (err: unknown) {
                Logger.warn(`UNRENDERABLE-HELP: [${args}]`);
                Logger.warn(cast<Error>(err).message);

                sayAt(player, `Invalid help file for ${args}.`);
            }
        },
};

export default cmd;
