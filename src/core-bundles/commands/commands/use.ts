import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import ItemUtil from '../../../lib/util/items';
import Logger from '../../../lib/util/logger';
import {CommandDefinitionFactory} from '../../../lib/commands/command';
import {humanize} from '../../../lib/util/time';

const {sayAt} = Broadcast;

/**
 * Command for items with `usable` behavior. See bundles/ranvier-areas/areas/limbo/items.yml for
 * example behavior implementation
 */
export const cmd: CommandDefinitionFactory = {
    name: 'use',
    aliases: ['quaff', 'recite'],
    command: state => (args, player) => {
        if (!args.length) {
            sayAt(player, 'Use what?');

            return;
        }

        const item = ArgParser.parseDot(args, player.inventory);

        if (!item) {
            sayAt(player, "You don't have anything like that.");

            return;
        }

        const usable = item.getBehavior('usable');

        if (!usable) {
            sayAt(player, "You can't use that.");

            return;
        }

        if ('charges' in usable && usable.charges <= 0) {
            sayAt(player, `You've used up all the magic in ${ItemUtil.display(item)}.`);

            return;
        }

        if (usable.spell) {
            const useSpell = state.SpellManager.get(usable.spell);

            if (!useSpell) {
                Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);

                sayAt(player, "You can't use that.");

                return;
            }

            useSpell.options = usable.options;
            if (usable.cooldown) {
                useSpell.cooldownLength = usable.cooldown;
            }

            try {
                useSpell.execute(null, player);
            }
            catch (e) {
                if (e instanceof SkillErrors.CooldownError) {
                    /* eslint-disable-next-line max-len */
                    sayAt(player, `${useSpell.name} is on cooldown. ${humanize(e.effect.remaining)} remaining.`);

                    return;
                }

                if (e instanceof SkillErrors.PassiveError) {
                    sayAt(player, 'That skill is passive.');

                    return;
                }

                if (e instanceof SkillErrors.NotEnoughResourcesError) {
                    sayAt(player, 'You do not have enough resources.');

                    return;
                }

                Logger.error(e.message);

                sayAt(player, 'Huh?');
            }
        }

        if (usable.effect) {
            const effectConfig = {name: item.name, ...usable.config || {}};
            const effectState = usable.state || {};

            const useEffect = state.EffectFactory.create(usable.effect, effectConfig, effectState);

            if (!useEffect) {
                Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);

                sayAt(player, "You can't use that.");

                return;
            }

            if (!player.addEffect(useEffect)) {
                sayAt(player, 'Nothing happens.');

                return;
            }
        }

        if (!('charges' in usable)) {
            return;
        }

        usable.charges -= 1;

        if (usable.destroyOnDepleted && usable.charges <= 0) {
            /* eslint-disable-next-line max-len */
            sayAt(player, `You used up all the magic in ${ItemUtil.display(item)} and it disappears in a puff of smoke.`);
            state.ItemManager.remove(item);
        }
    },
};

export default cmd;
