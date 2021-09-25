import type Command from './command';

export class CommandManager {
    public commands: Map<string, Command> = new Map<string, Command>();

    /**
     * Add the command and set up aliases
     */
    public add(command: Command): void {
        this.commands.set(command.name, command);

        for (const alias of command.aliases) {
            this.commands.set(alias, command);
        }
    }

    /**
     * Find a command from a partial name
     */
    public find(search: string): Command | null {
        for (const [name, command] of this.commands.entries()) {
            if (name.startsWith(search)) {
                return command;
            }
        }

        return null;
    }

    public findWithAlias(search: string): {command: Command; alias: string} | null {
        for (const [name, command] of this.commands.entries()) {
            if (name.startsWith(search)) {
                return {command: command, alias: name};
            }
        }

        return null;
    }

    /**
     * Get command by name
     */
    public get(name: string): Command | null {
        return this.commands.get(name) ?? null;
    }

    public remove(command: Command): void {
        this.commands.delete(command.name);
    }
}

export default CommandManager;
