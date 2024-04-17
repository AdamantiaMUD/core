import type CharacterClass from '../../classes/character-class.js';
import { noop } from '../../util/functions.js';

const mockCharacterClass: CharacterClass = {
    name: 'mock class',
    description: 'this class mocks people',
    abilityTable: {},
    setup: noop,
};

export default mockCharacterClass;
