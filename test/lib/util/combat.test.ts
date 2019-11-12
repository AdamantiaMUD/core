import each from 'jest-each';

import * as Combat from '~/lib/util/combat';
import Area from '~/lib/locations/area';
import ItemType from '~/lib/equipment/item-type';
import Npc from '~/lib/mobs/npc';

const makeArea = (name: string): Area => new Area(
    'test-bundle',
    name.toUpperCase(),
    {name}
);

describe('combat.ts', () => {
    describe('makeCorpse()', () => {
        const testCases = [
            [
                new Npc(
                    makeArea('foo'),
                    {
                        description: 'Sample NPC #1',
                        id: 'sample-1',
                        keywords: [],
                        name: 'Sample Bob',
                        level: 1,
                    }
                ),
                {
                    id: 'corpse',
                    name: 'Corpse of Sample Bob',
                    roomDesc: 'Corpse of Sample Bob',
                    description: 'The rotting corpse of Sample Bob',
                    keywords: ['corpse'],
                    type: ItemType.CONTAINER,
                    metadata: {
                        noPickup: true,
                    },
                    maxItems: 0,
                    behaviors: {
                        decay: {
                            duration: 180,
                        },
                    },
                },
            ]
        ];

        each(testCases).it('should make the corpse correctly', (npc, output) => {
            expect(Combat.makeCorpse(npc)).toStrictEqual(output);
        });
    });
});
