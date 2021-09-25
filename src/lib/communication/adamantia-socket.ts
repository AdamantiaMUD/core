import type {Socket} from 'net';

export type AdamantiaSocket = Socket & {
    ended: boolean;
    finished: boolean;
    fresh: boolean;
};

export default AdamantiaSocket;
