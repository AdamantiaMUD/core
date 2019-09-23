import Sequences from './sequences';
import TelnetSocket from './telnet-socket';
import TransportStream from '../transport-stream';

/**
 * Thin wrapper around a @worldofpannotia/ranvier-telnet `TelnetSocket`
 */
export class TelnetStream extends TransportStream<TelnetSocket> {
    public attach(socket: TelnetSocket): void {
        super.attach(socket);

        socket.on('data', message => {
            this.emit('data', message);
        });

        socket.on('error', err => {
            this.emit('error', err);
        });

        this.socket.on('DO', opt => {
            this.socket.telnetCommand(Sequences.WONT, opt);
        });
    }

    public get writable(): boolean {
        return this.socket.writable;
    }

    public write(message: string, encoding: string = 'utf8'): void {
        if (!this.writable) {
            return;
        }

        this.socket.write(message, encoding);
    }

    public pause(): void {
        this.socket.pause();
    }

    public resume(): void {
        this.socket.resume();
    }

    public end(): void {
        this.socket.end();
    }

    public executeToggleEcho(): void {
        this.socket.toggleEcho();
    }
}

export default TelnetStream;
