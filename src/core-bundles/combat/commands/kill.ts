import Logger from '../../../lib/util/logger';
import {CombatError} from '../../../lib/combat/errors';
import {cast, hasValue} from '../../../lib/util/functions';
import {isNpc} from '../../../lib/util/characters';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast';

import type CharacterInterface from '../../../lib/characters/character-interface';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'kill',
    aliases: ['attack', 'slay'],
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Kill whom?');

            return;
        }

        if (!hasValue(player.room)) {
            // @TODO: throw?
            return;
        }

        let target: CharacterInterface | null = null;

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

        sayAt(player, `You attack ${target.name}.`);

        player.combat.initiate(target);

        const excludeList: Player[] = [player];

        if (!isNpc(target)) {
            sayAt(cast<Player>(target), `${player.name} attacks you!`);
            excludeList.push(cast<Player>(target));
        }

        sayAtExcept(player.room, `${player.name} attacks ${target.name}!`, excludeList);
    },
};

export default cmd;
