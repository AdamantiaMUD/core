import {noop} from '../../util/functions';

import type CommandDefinitionFactory from '../../commands/command-definition-factory';
import type CommandExecutable from '../../commands/command-executable';

const mockCommand: CommandDefinitionFactory = {
    name: 'mock-command',
    command: (): CommandExecutable => noop,
};

export default mockCommand;
