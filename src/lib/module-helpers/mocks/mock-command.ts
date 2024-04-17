import type CommandDefinitionFactory from '../../commands/command-definition-factory.js';
import type CommandExecutable from '../../commands/command-executable.js';
import { noop } from '../../util/functions.js';

const mockCommand: CommandDefinitionFactory = {
    name: 'mock-command',
    command: (): CommandExecutable => noop,
};

export default mockCommand;
