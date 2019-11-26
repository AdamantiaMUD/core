import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import {CombatError} from '../../../lib/combat/combat-errors';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'consider',
    aliases: ['con'],
    usage: 'consider <target>',

    command: (state: GameState) => (args, player) => {
        if (!args || !args.length) {
            sayAt(player, 'Who do you want to size up for a fight?');

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
            sayAt(player, 'They aren\'t here.');

            return;
        }

        let description = '';

        switch (true) {
            case player.level - target.level > 4:
                /* eslint-disable-next-line max-len */
                description = 'They are much weaker than you. You would have no trouble dealing with a few of them at once.';
                break;

            case target.level - player.level > 9:
                /* eslint-disable-next-line max-len */
                description = 'They are <b>much</b> stronger than you. They will kill you and it will hurt the whole time you\'re dying.';
                break;

            case target.level - player.level > 5:
                /* eslint-disable-next-line max-len */
                description = 'They are quite a bit more powerful than you. You would need to get lucky to defeat them.';
                break;

            case target.level - player.level > 3:
                /* eslint-disable-next-line max-len */
                description = 'They are a bit stronger than you. You may survive but it would be hard won.';
                break;

            default:
                /* eslint-disable-next-line max-len */
                description = 'You are nearly evenly matched. You should be wary fighting more than one at a time.';
                break;
        }

        sayAt(player, description);
    },
};

export default cmd;
