import Command from './command';

export class CommandManager {
    public commands: Map<string, Command> = new Map();

    /**
     * Add the command and set up aliases
     */
    public add(command: Command): void {
        this.commands.set(command.name, command);

        if (command.aliases) {
            command.aliases.forEach(alias => this.commands.set(alias, command));
        }
    }

    /**
     * Find a command from a partial name
     */
    public find(search: string): Command {
        for (const [name, command] of this.commands.entries()) {
            if (name.indexOf(search) === 0) {
                return command;
            }
        }

        return void 0;
    }

    public findWithAlias(search: string): {command: Command; alias: string} {
        for (const [name, command] of this.commands.entries()) {
            if (name.indexOf(search) === 0) {
                return {command: command, alias: name};
            }
        }

        return void 0;
    }

    /**
     * Get command by name
     */
    public get(name: string): Command {
        return this.commands.get(name);
    }

    public remove(command: Command): void {
        this.commands.delete(command.name);
    }
}

export default CommandManager;
