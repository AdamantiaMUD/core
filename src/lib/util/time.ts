import humanizeDuration from 'humanize-duration';

export const humanize = (ms: number): string => humanizeDuration(ms, {round: true});
