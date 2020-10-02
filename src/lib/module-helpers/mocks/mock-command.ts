import {noop} from '../../util/functions';

import type {CommandDefinitionFactory, CommandExecutable} from '../../commands/command';

const mockCommand: CommandDefinitionFactory = {
    name: 'mock-command',
    command: (): CommandExecutable => noop,
};

export default mockCommand;
