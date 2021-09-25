/* eslint-disable import/prefer-default-export */
import Npc from '../mobs/npc';

import type Character from '../characters/character';

export const isNpc = (char: Character): char is Npc => char instanceof Npc;
