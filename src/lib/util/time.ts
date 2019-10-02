import humanizeDuration from 'humanize-duration';

export const humanize = (sec: number): string => humanizeDuration(sec, {round: true});
