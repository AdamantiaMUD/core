import {EventEmitter} from 'events';
import type {ExecFileOptionsWithOtherEncoding} from 'child_process';

import type {AddressInfo} from 'net';

import Options from './options';
import Sequences from './sequences';
import {hasValue} from '../../../lib/util/functions';

import type AdamantiaSocket from '../../../lib/communication/adamantia-socket';

export type Willingness = Sequences.WILL | Sequences.WONT | Sequences.DO | Sequences.DONT;

type BufferEncoding = ExecFileOptionsWithOtherEncoding['encoding'];

export class TelnetSocket extends EventEmitter {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public echoing: boolean;
    public gaMode: Sequences | null = null;
    public maxInputLength: number;
    public socket: AdamantiaSocket | null = null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(opts: {maxInputLength?: number; [key: string]: unknown} = {}) {
        super();

        this.maxInputLength = opts.maxInputLength ?? 512;
        this.echoing = true;
    }

    public get readable(): boolean {
        return this.socket?.readable ?? false;
    }

    public get writable(): boolean {
        return this.socket?.writable ?? false;
    }

    public address(): AddressInfo | string | null {
        return this.socket?.address() ?? null;
    }

    public end(str: Uint8Array | string = '', encoding: BufferEncoding = 'utf8'): void {
        this.socket?.end(str, encoding);
    }

    public write(data: Uint8Array | string, encoding?: BufferEncoding): void {
        let dataBuf: Buffer;

        if (Buffer.isBuffer(data)) {
            dataBuf = data;
        }
        else {
            dataBuf = Buffer.from(data as string, encoding);
        }

        // escape IACs by duplicating
        let iacs = 0;

        for (const val of dataBuf.values()) {
            if (val === Sequences.IAC) {
                iacs += 1;
            }
        }

        if (iacs > 0) {
            const buf = Buffer.alloc(data.length + iacs);

            for (let i = 0, j = 0; i < data.length; i++) {
                buf[j] = dataBuf[i];
                j += 1;

                if (data[i] === Sequences.IAC) {
                    buf[j] = Sequences.IAC;
                    j += 1;
                }
            }
        }

        try {
            if (!this.socket?.ended && !this.socket?.finished) {
                this.socket?.write(data);
            }
        }
        catch (err: unknown) {
            this.emit('error', err);
        }
    }

    public setEncoding(encoding: BufferEncoding): void {
        this.socket?.setEncoding(encoding);
    }

    public pause(): void {
        this.socket?.pause();
    }

    public resume(): void {
        this.socket?.resume();
    }

    public destroy(): void {
        this.socket?.destroy();
    }

    /**
     * Execute a telnet command
     */
    public telnetCommand(willingness: Willingness, command: number | number[]): void {
        const seq = [Sequences.IAC, willingness];

        if (Array.isArray(command)) {
            seq.push(...command);
        }
        else {
            seq.push(command);
        }

        this.socket?.write(Buffer.from(seq));
    }

    public toggleEcho(): void {
        this.echoing = !this.echoing;

        this.telnetCommand(this.echoing ? Sequences.WONT : Sequences.WILL, Options.OPT_ECHO);
    }

    /**
     * Send a GMCP message
     * https://www.gammon.com.au/gmcp
     */
    public sendGMCP(gmcpPackage: string, data: unknown): void {
        const gmcpData = `${gmcpPackage} ${JSON.stringify(data)}`;
        const dataBuffer = Buffer.from(gmcpData);
        const seqStartBuffer = Buffer.from([
            Sequences.IAC,
            Sequences.SB,
            Options.OPT_GMCP,
        ]);
        const seqEndBuffer = Buffer.from([Sequences.IAC, Sequences.SE]);

        this.socket?.write(Buffer.concat(
            [
                seqStartBuffer,
                dataBuffer,
                seqEndBuffer,
            ],
            gmcpData.length + 5
        ));
    }

    public attach(connection: AdamantiaSocket): void {
        this.socket = connection;

        let inputBuf = Buffer.alloc(this.maxInputLength),
            inputLen = 0;

        /**
         * @event TelnetSocket#error
         * @param {Error} err
         */
        connection.on('error', (err: unknown) => this.emit('error', err));

        this.socket.write('\r\n');

        connection.on('data', (dataBuf: Buffer) => {
            dataBuf.copy(inputBuf, inputLen);
            inputLen += dataBuf.length;

            /*
             * immediately start consuming data if we begin receiving normal data
             * instead of telnet negotiation
             */
            if (connection.fresh && dataBuf[0] !== Sequences.IAC) {
                connection.fresh = false;
            }

            dataBuf = inputBuf.slice(0, inputLen);

            /*
             * fresh makes sure that even if we haven't gotten a newline but the client
             * sent us some initial negotiations to still interpret them
             */
            if (!hasValue((/[\r\n]/u).exec(dataBuf.toString())) && !connection.fresh) {
                return;
            }

            /*
             * If multiple commands were sent \r\n separated in the same packet process
             * them separately. Some client auto-connect features do this
             */
            let bucket: number[] = [];

            for (let i = 0; i < inputLen; i++) {
                // LF character (`\n`)
                if (dataBuf[i] === 10) {
                    this.input(Buffer.from(bucket));
                    bucket = [];
                }
                else {
                    bucket.push(dataBuf[i]);
                }
            }

            if (bucket.length > 0) {
                this.input(Buffer.from(bucket));
            }

            inputBuf = Buffer.alloc(this.maxInputLength);
            inputLen = 0;
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
     * @param {Buffer} inputBuf
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
    public input(inputBuf: Buffer): void {
        // strip any negotiations
        const cleanBuf = Buffer.alloc(inputBuf.length);

        let i = 0,
            cleanLen = 0,
            subNegBuffer: Buffer | null = null,
            subNegOpt: number | null = null;

        while (i < inputBuf.length) {
            if (inputBuf[i] === Sequences.IAC) {
                const cmd = inputBuf[i + 1];
                const opt = inputBuf[i + 2];

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
                        subNegOpt = inputBuf[i];

                        i += 1;
                        subNegBuffer = Buffer.alloc(inputBuf.length - i, ' ');

                        let subLen = 0;

                        while (inputBuf[i] !== Sequences.IAC) {
                            subNegBuffer[subLen] = inputBuf[i];

                            subLen += 1;
                            i += 1;
                        }
                        break;
                    }

                    case Sequences.SE:
                        if (subNegOpt === Options.OPT_GMCP) {
                            const gmcpString = subNegBuffer?.toString().trim() ?? '';
                            const gmcpData = gmcpString.split(' ');

                            const gmcpPackage = gmcpData.shift();

                            const gmcpPayloadString = gmcpData.join(' ');

                            /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                            const gmcpPayload = gmcpPayloadString.length > 0
                                ? JSON.parse(gmcpPayloadString)
                                : null;

                            /**
                             * @event TelnetSocket#GMCP
                             * @param {string} gmcpPackage
                             * @param {*} gmcpData
                             */
                            this.emit('GMCP', gmcpPackage, gmcpPayload);
                        }
                        else {
                            /**
                             * @event TelnetSocket#SUBNEG
                             * @param {number} subnegOpt SB option
                             * @param {Buffer} subnegBuffer Buffer of data inside subnegotiation package
                             */
                            this.emit('SUBNEG', subNegOpt, subNegBuffer);
                        }

                        i += 2;
                        break;

                    default:
                        /**
                         * @event TelnetSocket#unknownAction
                         * @param {number} cmd Command byte specified after IAC
                         * @param {number} opt Opt byte specified after command byte
                         */
                        this.emit('unknown-action', cmd, opt);

                        i += 2;
                        break;
                }
            }
            else {
                cleanBuf[cleanLen] = inputBuf[i];
                cleanLen += 1;
                i += 1;
            }
        }

        if (this.socket?.fresh) {
            this.socket.fresh = false;

            return;
        }

        /**
         * @event TelnetSocket#data
         * @param {Buffer} data
         */
        this.emit('data', cleanBuf.slice(0, cleanLen - 1));
    }
}

export default TelnetSocket;
