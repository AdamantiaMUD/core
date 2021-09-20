import Broadcast from '../../../lib/communication/broadcast';
import Logger from '../../../lib/common/logger';
import {CombatError} from '../../../lib/combat/errors';
import {cast, hasValue} from '../../../lib/util/functions';

import type Character from '../../../lib/characters/character';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'consider',
    aliases: ['con'],
    usage: 'consider <target>',

    command: (state: GameStateData): CommandExecutable => (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

        if (args.length === 0) {
            sayAt(player, 'Who do you want to size up for a fight?');

            return;
        }

        let target: Character | null = null;

        try {
            target = state.combat?.findCombatant(player, args) ?? null;
        }
        catch (err: unknown) {
            if (err instanceof CombatError) {
                sayAt(player, err.message);

                return;
            }

            Logger.error(cast<Error>(err).message);
        }

        if (!hasValue(target)) {
            sayAt(player, "They aren't here.");

            return;
        }

        let description;

        switch (true) {
            case player.level - target.level > 4:
                description = 'They are much weaker than you. You would have no trouble dealing with a few of them at once.';
                break;

            case target.level - player.level > 9:
                description = "They are {bold much} stronger than you. They will kill you, and it will hurt the whole time you're dying.";
                break;

            case target.level - player.level > 5:
                description = 'They are quite a bit more powerful than you. You would need to get lucky to defeat them.';
                break;

            case target.level - player.level > 3:
                description = 'They are a bit stronger than you. You may survive, but it would be hard won.';
                break;

            default:
                description = 'You are nearly evenly matched. You should be wary fighting more than one at a time.';
                break;
        }

        sayAt(player, description);
    },
};

export default cmd;
