import {Chance} from 'chance';

export const random: Chance.Chance = new Chance();

export const probability = (likelihood: number): boolean => random.bool({likelihood});

export default random;
