/* eslint-disable import/prefer-default-export */
import type Character from '../characters/character.js';
import Npc from '../mobs/npc.js';

export const isNpc = (char: Character): char is Npc => char instanceof Npc;
