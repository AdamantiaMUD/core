import commandQueuedListener from './events/player/command-queued';
import experienceListener from './events/player/experience';
import moveListener from './events/player/move';
import saveListener from './events/player/save';
import updateTickListener from './events/player/update-tick';
import {PlayerEventListenersDefinition} from '../../lib/events/player-events';

export const playerEvents: PlayerEventListenersDefinition = {
    listeners: {
        commandQueued: commandQueuedListener,

        /**
         * Handle player gaining experience
         */
        experience: experienceListener,

        /**
         * Handle a player movement command. From: 'commands' input event.
         * movementCommand is a result of CommandParser.parse
         */
        move: moveListener,

        save: saveListener,

        updateTick: updateTickListener,
    },
};

export default playerEvents;
