import type Character from '../../../lib/characters/character.js';
import { CombatError } from '../../../lib/combat/errors/index.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import Logger from '../../../lib/common/logger.js';
import { sayAt, sayAtExcept } from '../../../lib/communication/broadcast.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import { isNpc } from '../../../lib/util/characters.js';
import { cast, hasValue } from '../../../lib/util/functions.js';

export const cmd: CommandDefinitionFactory = {
    name: 'kill',
    aliases: ['attack', 'slay'],
    command:
        (state: GameStateData): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'Kill whom?');

                return;
            }

            if (!hasValue(player.room)) {
                // @TODO: throw?
                return;
            }

            let target: Character | null = null;

            try {
                target = state.combat?.findCombatant(player, args) ?? null;
            } catch (err: unknown) {
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

            sayAt(player, `You attack ${target.name}.`);

            player.combat.initiate(target);

            const excludeList: Player[] = [player];

            if (!isNpc(target)) {
                sayAt(cast<Player>(target), `${player.name} attacks you!`);
                excludeList.push(cast<Player>(target));
            }

            sayAtExcept(
                player.room,
                `${player.name} attacks ${target.name}!`,
                excludeList
            );
        },
};

export default cmd;
