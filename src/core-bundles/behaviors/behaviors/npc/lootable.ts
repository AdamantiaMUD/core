import Character from '../../../../lib/entities/character';
import Item, {ItemDefinition} from '../../../../lib/equipment/item';
import Logger from '../../../../lib/util/logger';
import LootTable from '../../../../lib/combat/loot-table';
import Npc from '../../../../lib/mobs/npc';
import Player from '../../../../lib/players/player';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {makeCorpse} from '../../../../lib/util/combat';

export const lootable: BehaviorDefinition = {
    listeners: {
        killed: state => async function(npc: Npc, config, killer: Character) {
            const {room, area} = npc;

            const lootTable = new LootTable(state, config);

            const currencies = lootTable.currencies();
            const roll = await lootTable.roll();

            const items = roll.map(item => state.itemFactory.create(item, area));

            const corpseDef: ItemDefinition = makeCorpse(npc);

            corpseDef.maxItems = items.length;

            const corpse = new Item(corpseDef, area);

            corpse.hydrate(state);

            Logger.log(`Generated corpse: ${corpse.uuid}`);

            items.forEach(item => {
                item.hydrate(state);
                corpse.addItem(item);
            });

            room.addItem(corpse);

            state.itemManager.add(corpse);

            if (killer && killer instanceof Player) {
                if (currencies) {
                    currencies.forEach(currency => {
                        // distribute currency among group members in the same room
                        const recipients = (killer.party ? [...killer.party] : [killer])
                            .filter(recipient => recipient.room === killer.room);

                        let remaining = currency.amount;

                        for (const recipient of recipients) {
                            /*
                             * Split currently evenly amount recipients. The way
                             * the math works out the leader  of the party will
                             * get any remainder if the currency isn't divisible
                             * evenly
                             */
                            const amount = Math.floor(remaining / recipients.length)
                                + (remaining % recipients.length);

                            remaining -= amount;

                            recipient.emit('currency', currency.name, amount);

                            state.commandManager.get('look').execute(corpse.uuid, recipient);
                        }
                    });
                }
            }
        },
    },
};

export default lootable;
