import Logger from '../../../lib/util/logger';
import {
    center,
    line,
    sayAt,
    wrap,
} from '../../../lib/communication/broadcast';
import {cast, hasValue} from '../../../lib/util/functions';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Helpfile from '../../../lib/help/helpfile';
import type Player from '../../../lib/players/player';

const render = (state: GameStateData, helpFile: Helpfile): string => {
    const body = helpFile.body;
    const name = helpFile.name;

    const width = 80;
    const bar = `${line(width, '-', 'yellow')}\r\n`;

    let header = `${bar + center(width, name, 'white')}\r\n${bar}`;

    const formatHeaderItem = (item: string, value: string): string => `${item}: ${value}\r\n\r\n`;

    if (hasValue(helpFile.command)) {
        const actualCommand = state.commandManager.get(helpFile.command)!;

        header += formatHeaderItem('Syntax', actualCommand.usage);

        if (actualCommand.aliases.length > 0) {
            header += formatHeaderItem('Aliases', actualCommand.aliases.join(', '));
        }
    }
    else if (hasValue(helpFile.channel)) {
        header += formatHeaderItem('Syntax', state.channelManager.get(helpFile.channel).getUsage());
    }

    let footer = bar;

    if (helpFile.related.length > 0) {
        footer = `${center(width, 'RELATED', 'yellow', '-')}\r\n`;
        const related = helpFile.related.join(', ');

        footer += `${center(width, related)}\r\n`;
        footer += bar;
    }

    return header + wrap(body, 80) + footer;
};

const searchHelpFiles = (rawArgs: string, player: Player, state: GameStateData): void => {
    const args = rawArgs.split(' ')
        .slice(1)
        .join(' ');

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

    /* eslint-disable max-len */
    sayAt(player, '<yellow>---------------------------------------------------------------------------------</yellow>');
    sayAt(player, '<white>Search Results:</white>');
    sayAt(player, '<yellow>---------------------------------------------------------------------------------</yellow>');
    /* eslint-enable max-len */

    for (const [name] of results) {
        sayAt(player, `<cyan>${name}</cyan>`);
    }
};

export const cmd: CommandDefinitionFactory = {
    name: 'help',
    usage: 'help [search] [topic keyword]',
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

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

            sayAt(player, "Sorry, I couldn't find an entry for that topic.");

            return;
        }

        try {
            sayAt(player, render(state, helpfile));
        }
        catch (err: unknown) {
            Logger.warn(`UNRENDERABLE-HELP: [${args}]`);
            Logger.warn(cast<Error>(err).message);

            sayAt(player, `Invalid help file for ${args}.`);
        }
    },
};

export default cmd;
