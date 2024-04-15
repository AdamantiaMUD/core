import type CharacterClass from './character-class.js';

/**
 * Simple map of class name => class instance
 */
export class CharacterClassManager extends Map<string, CharacterClass> {}

export default CharacterClassManager;
