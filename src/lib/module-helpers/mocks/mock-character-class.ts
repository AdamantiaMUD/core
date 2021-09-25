import {noop} from '../../util/functions';

import type CharacterClass from '../../classes/character-class';

const mockCharacterClass: CharacterClass = {
    name: 'mock class',
    description: 'this class mocks people',
    abilityTable: {},
    setup: noop,
};

export default mockCharacterClass;
