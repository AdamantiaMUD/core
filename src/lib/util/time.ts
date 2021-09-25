/* eslint-disable import/prefer-default-export */
import {HumanizeDuration, HumanizeDurationLanguage} from 'humanize-duration-ts';

const langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
const humanizer: HumanizeDuration = new HumanizeDuration(langService);

/* eslint-disable-next-line id-length */
export const humanize = (ms: number): string => humanizer.humanize(ms, {round: true});
