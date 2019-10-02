import {CommandDefinitionFactory} from '../../../lib/commands/command';

export const cmd: CommandDefinitionFactory = {
    name: 'credits',
    command: state => (args, player) => {
        state.commandManager.get('help').execute('credits', player);
    },
};

export default cmd;
