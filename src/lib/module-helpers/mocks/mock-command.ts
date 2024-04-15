import {noop} from '../../util/functions.js';

import type CommandDefinitionFactory from '../../commands/command-definition-factory.js';
import type CommandExecutable from '../../commands/command-executable.js';

const mockCommand: CommandDefinitionFactory = {
    name: 'mock-command',
    command: (): CommandExecutable => noop,
};

export default mockCommand;
