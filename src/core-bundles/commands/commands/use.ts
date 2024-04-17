import {
    CooldownError,
    NotEnoughResourcesError,
    PassiveError,
} from '../../../lib/abilities/errors/index.js';
import ArgParser from '../../../lib/commands/arg-parser.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import Logger from '../../../lib/common/logger.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Item from '../../../lib/equipment/item.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import { cast, hasValue } from '../../../lib/util/functions.js';
import ItemUtil from '../../../lib/util/items.js';
import { humanize } from '../../../lib/util/time.js';
import type { UsableConfig } from '../../behaviors/behaviors/item/usable.js';

const handleSpell = (
    state: GameStateData,
    player: Player,
    item: Item,
    usable: UsableConfig
): void => {
    const useSpell = state.spellManager.get(usable.spell!);

    if (!hasValue(useSpell)) {
        Logger.error(
            `Item: ${item.entityReference} has invalid usable configuration.`
        );

        sayAt(player, "You can't use that.");

        return;
    }

    useSpell.options = usable.options ?? {};

    if (hasValue(usable.cooldown)) {
        useSpell.cooldownLength = usable.cooldown;
    }

    try {
        useSpell.execute('', player);
    } catch (err: unknown) {
        if (err instanceof CooldownError) {
            sayAt(
                player,
                `${useSpell.name} is on cooldown. ${humanize(err.effect.remaining)} remaining.`
            );

            return;
        }

        if (err instanceof PassiveError) {
            sayAt(player, 'That skill is passive.');

            return;
        }

        if (err instanceof NotEnoughResourcesError) {
            sayAt(player, 'You do not have enough resources.');

            return;
        }

        Logger.error(cast<Error>(err).message);

        sayAt(player, 'Huh?');
    }
};

const handleEffect = (
    state: GameStateData,
    player: Player,
    item: Item,
    usable: UsableConfig
): void => {
    const effectConfig = { name: item.name, ...(usable.config ?? {}) };
    const effectState = usable.state ?? {};

    const useEffect = state.effectFactory.create(
        usable.effect!,
        effectConfig,
        effectState
    );

    if (!hasValue(useEffect)) {
        Logger.error(
            `Item: ${item.entityReference} has invalid usable configuration.`
        );

        sayAt(player, "You can't use that.");

        return;
    }

    if (!player.addEffect(useEffect)) {
        sayAt(player, 'Nothing happens.');
    }
};

/**
 * Command for items with `usable` behavior. See bundles/ranvier-areas/areas/limbo/items.yml for
 * example behavior implementation
 */
export const cmd: CommandDefinitionFactory = {
    name: 'use',
    aliases: ['quaff', 'recite'],
    command:
        (state: GameStateData) =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'Use what?');

                return;
            }

            const item = ArgParser.parseDot(
                args,
                Array.from(player.inventory.items)
            );

            if (!hasValue(item)) {
                sayAt(player, "You don't have anything like that.");

                return;
            }

            const usable = item.getBehavior('usable') as UsableConfig | null;

            if (!hasValue(usable)) {
                sayAt(player, "You can't use that.");

                return;
            }

            if (hasValue(usable.charges) && usable.charges <= 0) {
                sayAt(
                    player,
                    `You've used up all the magic in ${ItemUtil.display(item)}.`
                );

                return;
            }

            if (hasValue(usable.spell)) {
                handleSpell(state, player, item, usable);

                return;
            }

            if (hasValue(usable.effect)) {
                handleEffect(state, player, item, usable);

                return;
            }

            if (!hasValue(usable.charges)) {
                return;
            }

            usable.charges -= 1;

            if (usable.destroyOnDepleted && usable.charges <= 0) {
                sayAt(
                    player,
                    `You used up all the magic in ${ItemUtil.display(item)} and it disappears in a puff of smoke.`
                );

                state.itemManager.remove(item);
            }
        },
};

export default cmd;
