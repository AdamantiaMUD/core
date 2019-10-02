export type ExecutableCommand = {
    execute(): void;
    label: string;
    lag: number;
}

/**
 * Keeps track of the queue off commands to execute for a player
 */
export class CommandQueue {
    /* eslint-disable lines-between-class-members */
    private readonly _commands: ExecutableCommand[] = [];
    private _lag: number = 0;
    private _lastRun: number = 0;
    /* eslint-enable lines-between-class-members */

    public get hasPending(): boolean {
        return this._commands.length > 0;
    }

    /**
     * Seconds until the next command can be executed
     */
    public get lagRemaining(): number {
        return this.msTilNextRun / 1000;
    }

    /**
     * Milliseconds til the next command can be executed
     */
    public get msTilNextRun(): number {
        return Math.max(0, (this._lastRun + this._lag) - Date.now());
    }

    public get queue(): ExecutableCommand[] {
        return this._commands;
    }

    /**
     * Safely add lag to the current queue. This method will not let you add a
     * negative amount as a safety measure. If you want to subtract lag you can
     * directly manipulate the `lag` property.
     */
    public addLag(amount: number): void {
        this._lag += Math.max(0, amount);
    }

    public enqueue(executable: ExecutableCommand, lag: number): number {
        return this._commands.push({...executable, lag}) - 1;
    }

    /**
     * Execute the currently pending command if it's ready
     */
    public execute(): boolean {
        if (!this._commands.length || this.msTilNextRun > 0) {
            return false;
        }

        const command = this._commands.shift();

        this._lastRun = Date.now();
        this._lag = command.lag;
        command.execute();

        return true;
    }

    /**
     * Flush all pending commands. Does _not_ reset lastRun/lag. Meaning that if
     * the queue is flushed after a command was just run its lag will still have
     * to expire before another command can be run. To fully reset the queue use
     * the reset() method.
     */
    public flush(): void {
        this._commands.length = 0;
    }

    /**
     * Milliseconds until the command at the given index can be run
     */
    public getMsTilRun(commandIndex: number): number {
        if (commandIndex >= this._commands.length) {
            throw new RangeError('Invalid command index');
        }

        let lagTotal = this.msTilNextRun;

        for (let i = 0; i <= commandIndex; i++) {
            lagTotal += this._commands[i].lag;
        }

        return lagTotal;
    }

    /**
     * For a given command index find how many seconds until it will run
     */
    public getTimeTilRun(commandIndex: number): number {
        return this.getMsTilRun(commandIndex) / 1000;
    }

    /**
     * Completely reset the queue and any lag. This is fairly dangerous as if the
     * player could reliably reset the queue they could negate any command lag. To
     * clear commands without altering lag use flush()
     */
    public reset(): void {
        this.flush();
        this._lastRun = 0;
        this._lag = 0;
    }
}

export default CommandQueue;
