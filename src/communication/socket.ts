import {Socket as NetSocket} from 'net';

export type Socket = NetSocket & {fresh: boolean};

export default Socket;
