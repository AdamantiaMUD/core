/* eslint-disable import/prefer-default-export */
import Npc from '../mobs/npc';

import type CharacterInterface from '../characters/character-interface';

export const isNpc = (char: CharacterInterface): char is Npc => char instanceof Npc;
