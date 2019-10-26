import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import Player from '../../../lib/players/player';
import {CombatError} from '../../../lib/combat/combat-errors';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt, sayAtExcept} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'kill',
    aliases: ['attack', 'slay'],
    command: (state: GameState) => (rawArgs: string, player: Player) => {
        const args = rawArgs.trim();

        if (!args.length) {
            sayAt(player, 'Kill whom?');

            return;
        }

        let target = null;

        try {
            target = state.combat.findCombatant(player, args);
        }
        catch (e) {
            if (e instanceof CombatError) {
                sayAt(player, e.message);

                return;
            }

            Logger.error(e.message);
        }

        if (!target) {
            sayAt(player, "They aren't here.");

            return;
        }

        sayAt(player, `You attack ${target.name}.`);

        player.combat.initiate(target);

        sayAtExcept(player.room, `${player.name} attacks ${target.name}!`, [player, target]);

        if (!target.isNpc) {
            sayAt(target, `${player.name} attacks you!`);
        }
    },
};

export default cmd;
