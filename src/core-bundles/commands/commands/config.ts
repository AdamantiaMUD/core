import {hasValue} from '../../../lib/util/functions.js';
import {sayAt} from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type SimpleMap from '../../../lib/util/simple-map.js';

export const cmd: CommandDefinitionFactory = {
    name: 'config',
    usage: 'config <set [setting] [value] | list>',
    aliases: [
        'toggle',
        'options',
        'set',
    ],
    command: (state: GameStateData): CommandExecutable => (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

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
            sayAt(player, `{red Invalid config command: ${command}}`);

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
            sayAt(player, `{red Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}}`);

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        if (!hasValue(valueToSet)) {
            sayAt(player, `{red What value do you want to set for ${configToSet}?}`);

            state.commandManager.get('help')?.execute('config', player);

            return;
        }

        if (valueToSet.toLowerCase() !== 'on' && valueToSet.toLowerCase() !== 'off') {
            sayAt(player, '{red Value must be either: on / off}');

            return;
        }

        const isActive = valueToSet.toLowerCase() === 'on';

        if (!hasValue(player.getMeta<SimpleMap<boolean>>('config'))) {
            player.setMeta<SimpleMap<boolean>>('config', {});
        }

        player.setMeta<boolean>(`config.${configToSet}`, isActive);

        sayAt(player, 'Configuration value saved');
    },
};

export default cmd;
