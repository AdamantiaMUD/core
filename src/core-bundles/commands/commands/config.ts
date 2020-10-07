import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type SimpleMap from '../../../lib/util/simple-map';

export const cmd: CommandDefinitionFactory = {
    name: 'config',
    usage: 'config <set/list> [setting] [value]',
    aliases: [
        'toggle',
        'options',
        'set',
    ],
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Configure what?');

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        const possibleCommands = ['set', 'list'];

        const [
            command,
            configToSet,
            valueToSet,
        ] = args.split(' ');

        if (!possibleCommands.includes(command)) {
            sayAt(player, `<red>Invalid config command: ${command}</red>`);

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        if (command === 'list') {
            sayAt(player, 'Current Settings:');

            const config = player.getMeta<SimpleMap<boolean>>('config');

            for (const key in config) {
                if (Object.prototype.hasOwnProperty.call(config, key)) {
                    const val = config[key] ? 'on' : 'off';

                    sayAt(player, `  ${key}: ${val}`);
                }
            }

            return;
        }

        if (!hasValue(configToSet)) {
            sayAt(player, 'Set what?');

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        // @TODO: make player-level configs something that can be extended by bundles; i.e. make this an enum, interface, registry, or something along those lines
        const possibleSettings = [
            'brief',
            'autoloot',
            'minimap',
        ];

        if (!possibleSettings.includes(configToSet)) {
            /* eslint-disable-next-line max-len */
            sayAt(player, `<red>Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        if (!hasValue(valueToSet)) {
            sayAt(player, `<red>What value do you want to set for ${configToSet}?</red>`);

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        /* eslint-disable-next-line id-length */
        const possibleValues = {on: true, off: false};

        if (possibleValues[valueToSet] === undefined) {
            sayAt(player, '<red>Value must be either: on / off</red>');

            return;
        }

        if (!hasValue(player.getMeta<SimpleMap<boolean>>('config'))) {
            player.setMeta<SimpleMap<boolean>>('config', {});
        }

        player.setMeta<SimpleMap<boolean>>(`config.${configToSet}`, possibleValues[valueToSet]);

        sayAt(player, 'Configuration value saved');
    },
};

export default cmd;
