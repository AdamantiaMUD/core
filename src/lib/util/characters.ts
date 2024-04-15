/* eslint-disable import/prefer-default-export */
import Npc from '../mobs/npc.js';

import type Character from '../characters/character.js';

export const isNpc = (char: Character): char is Npc => char instanceof Npc;
