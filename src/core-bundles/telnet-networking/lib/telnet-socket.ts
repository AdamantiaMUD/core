/* eslint-disable no-magic-numbers */
import EventEmitter from 'events';
import {AddressInfo} from 'net';

import AdamantiaSocket from '../../../lib/communication/adamantia-socket';
import Options from './options';
import Sequences from './sequences';

export type Willingness = Sequences.WILL | Sequences.WONT | Sequences.DO | Sequences.DONT;

export class TelnetSocket extends EventEmitter {
    /* eslint-disable lines-between-class-members */
    public echoing: boolean;
    public gaMode: Sequences;
    public maxInputLength: number;
    public socket: AdamantiaSocket;
    /* eslint-enable lines-between-class-members */

    public constructor(opts: {maxInputLength?: number; [key: string]: any} = {}) {
        super();

        this.socket = null;
        this.maxInputLength = opts.maxInputLength || 512;
        this.echoing = true;
        this.gaMode = null;
    }

    public get readable(): boolean {
        return this.socket.readable;
    }

    public get writable(): boolean {
        return this.socket.writable;
    }

    public address(): AddressInfo | string {
        return this.socket && this.socket.address();
    }

    public end(str: Uint8Array | string = '', encoding: string = 'utf8'): void {
        this.socket.end(str, encoding);
    }

    public write(data: Uint8Array | string, encoding?: string): void {
        if (!Buffer.isBuffer(data)) {
            data = new Buffer(data as string, encoding as BufferEncoding);
        }

        // escape IACs by duplicating
        let iacs = 0;

        for (const val of data.values()) {
            if (val === Sequences.IAC) {
                iacs += 1;
            }
        }

        if (iacs) {
            const b = new Buffer(data.length + iacs);

            for (let i = 0, j = 0; i < data.length; i++) {
                b[j] = data[i];
                j += 1;

                if (data[i] === Sequences.IAC) {
                    b[j] = Sequences.IAC;
                    j += 1;
                }
            }
        }

        try {
            if (!this.socket.ended && !this.socket.finished) {
                this.socket.write(data);
            }
        }
        catch (e) {
            this.emit('error', e);
        }
    }

    public setEncoding(encoding: string): void {
        this.socket.setEncoding(encoding);
    }

    public pause(): void {
        this.socket.pause();
    }

    public resume(): void {
        this.socket.resume();
    }

    public destroy(): void {
        this.socket.destroy();
    }

    /**
     * Execute a telnet command
     */
    public telnetCommand(willingness: Willingness, command: number | number[]): void {
        const seq = [Sequences.IAC, willingness];

        if (Array.isArray(command)) {
            seq.push.apply(seq, command);
        }
        else {
            seq.push(command);
        }

        this.socket.write(new Buffer(seq));
    }

    public toggleEcho(): void {
        this.echoing = !this.echoing;

        this.telnetCommand(this.echoing ? Sequences.WONT : Sequences.WILL, Options.OPT_ECHO);
    }

    /**
     * Send a GMCP message
     * https://www.gammon.com.au/gmcp
     */
    public sendGMCP(gmcpPackage: string, data: any): void {
        const gmcpData = `${gmcpPackage} ${JSON.stringify(data)}`;
        const dataBuffer = Buffer.from(gmcpData);
        const seqStartBuffer = new Buffer([Sequences.IAC, Sequences.SB, Options.OPT_GMCP]);
        const seqEndBuffer = new Buffer([Sequences.IAC, Sequences.SE]);

        this.socket.write(Buffer.concat([seqStartBuffer, dataBuffer, seqEndBuffer], gmcpData.length + 5));
    }

    public attach(connection: AdamantiaSocket): void {
        this.socket = connection;

        let inputbuf = new Buffer(this.maxInputLength),
            inputlen = 0;

        /**
         * @event TelnetSocket#error
         * @param {Error} err
         */
        connection.on('error', err => this.emit('error', err));

        this.socket.write('\r\n');

        connection.on('data', databuf => {
            databuf.copy(inputbuf, inputlen);
            inputlen += databuf.length;

            /*
             * immediately start consuming data if we begin receiving normal data
             * instead of telnet negotiation
             */
            if (connection.fresh && databuf[0] !== Sequences.IAC) {
                connection.fresh = false;
            }

            databuf = inputbuf.slice(0, inputlen);

            /*
             * fresh makes sure that even if we haven't gotten a newline but the client
             * sent us some initial negotiations to still interpret them
             */
            if (!databuf.toString().match(/[\r\n]/u) && !connection.fresh) {
                return;
            }

            /*
             * If multiple commands were sent \r\n separated in the same packet process
             * them separately. Some client auto-connect features do this
             */
            let bucket = [];

            for (let i = 0; i < inputlen; i++) {
                if (databuf[i] !== 10) { // \n
                    bucket.push(databuf[i]);
                } else {
                    this.input(Buffer.from(bucket));
                    bucket = [];
                }
            }

            if (bucket.length) {
                this.input(Buffer.from(bucket));
            }

            inputbuf = new Buffer(this.maxInputLength);
            inputlen = 0;
        });

        connection.on('close', () => {
            /**
             * @event TelnetSocket#close
             */
            this.emit('close');
        });
    }

    /**
     * Parse telnet input socket, swallowing any negotiations
     * and emitting clean, fresh data
     *
     * @param {Buffer} inputbuf
     *
     * @fires TelnetSocket#DO
     * @fires TelnetSocket#DONT
     * @fires TelnetSocket#GMCP
     * @fires TelnetSocket#SUBNEG
     * @fires TelnetSocket#WILL
     * @fires TelnetSocket#WONT
     * @fires TelnetSocket#data
     * @fires TelnetSocket#unknownAction
     */
    public input(inputbuf: Buffer): void {
        // strip any negotiations
        const cleanbuf = Buffer.alloc(inputbuf.length);

        let i = 0,
            cleanlen = 0,
            subnegBuffer = null,
            subnegOpt = null;

        while (i < inputbuf.length) {
            if (inputbuf[i] !== Sequences.IAC) {
                cleanbuf[cleanlen] = inputbuf[i];
                cleanlen += 1;
                i += 1;
            }
            else {
                const cmd = inputbuf[i + 1];
                const opt = inputbuf[i + 2];

                switch (cmd) {
                    case Sequences.DO:
                        if (opt === Options.OPT_EOR) {
                            this.gaMode = Sequences.EOR;
                        }
                        else {
                            /**
                             * @event TelnetSocket#DO
                             * @param {number} opt
                             */
                            this.emit('DO', opt);
                        }

                        i += 3;
                        break;

                    case Sequences.DONT:
                        if (opt === Options.OPT_EOR) {
                            this.gaMode = Sequences.GA;
                        }
                        else {
                            /**
                             * @event TelnetSocket#DONT
                             * @param {number} opt
                             */
                            this.emit('DONT', opt);
                        }

                        i += 3;
                        break;

                    case Sequences.WILL:
                        /**
                         * @event TelnetSocket#WILL
                         * @param {number} opt
                         */
                        this.emit('WILL', opt);

                        i += 3;
                        break;

                    /* falls through */
                    case Sequences.WONT:
                        /**
                         * @event TelnetSocket#WONT
                         * @param {number} opt
                         */
                        this.emit('WONT', opt);

                        i += 3;
                        break;

                    case Sequences.SB: {
                        i += 2;
                        subnegOpt = inputbuf[i];

                        i += 1;
                        subnegBuffer = Buffer.alloc(inputbuf.length - i, ' ');

                        let sublen = 0;

                        while (inputbuf[i] !== Sequences.IAC) {
                            subnegBuffer[sublen] = inputbuf[i];

                            sublen += 1;
                            i += 1;
                        }
                        break;
                    }

                    case Sequences.SE:
                        if (subnegOpt === Options.OPT_GMCP) {
                            let gmcpString = subnegBuffer.toString().trim(),
                                [gmcpPackage, ...gmcpData] = gmcpString.split(' ');

                            gmcpData = gmcpData.join(' ');
                            gmcpData = gmcpData.length ? JSON.parse(gmcpData) : null;

                            /**
                             * @event TelnetSocket#GMCP
                             * @param {string} gmcpPackage
                             * @param {*} gmcpData
                             */
                            this.emit('GMCP', gmcpPackage, gmcpData);
                        }
                        else {
                            /**
                             * @event TelnetSocket#SUBNEG
                             * @param {number} subnegOpt SB option
                             * @param {Buffer} subnegBuffer Buffer of data inside subnegotiation package
                             */
                            this.emit('SUBNEG', subnegOpt, subnegBuffer);
                        }

                        i += 2;
                        break;

                    default:
                        /**
                         * @event TelnetSocket#unknownAction
                         * @param {number} cmd Command byte specified after IAC
                         * @param {number} opt Opt byte specified after command byte
                         */
                        this.emit('unknownAction', cmd, opt);

                        i += 2;
                        break;
                }
            }
        }

        if (this.socket.fresh) {
            this.socket.fresh = false;

            return;
        }

        /**
         * @event TelnetSocket#data
         * @param {Buffer} data
         */
        this.emit('data', cleanbuf.slice(0, cleanlen - 1));
    }
}

export default TelnetSocket;
