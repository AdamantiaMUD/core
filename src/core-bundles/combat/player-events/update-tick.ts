import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import WebsocketStream from '../../websocket-networking/lib/WebsocketStream';
import {CombatInvalidTargetError} from '../../../lib/combat/combat-errors';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {prompt, sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'update-tick',
    listener: (state: GameState): PlayerEventListener => {
        /**
         * @listens Player#updateTick
         */
        return (player: Player) => {
            if (!player.combat.isInCombat()) {
                return;
            }

            state.combat.startRegeneration(state, player);

            let hadActions = false;

            try {
                hadActions = state.combat.updateRound(state, player);
            }
            catch (e) {
                if (e instanceof CombatInvalidTargetError) {
                    sayAt(player, "You can't attack that target.");
                }
                else {
                    throw e;
                }
            }

            if (!hadActions) {
                return;
            }

            const usingWebsockets = player.socket instanceof WebsocketStream;

            // don't show the combat prompt to a websockets server
            if (!player.hasPrompt('combat') && !usingWebsockets) {
                player.addPrompt('combat', () => state.combat.buildPrompt(player));
            }

            sayAt(player, '');
            if (!usingWebsockets) {
                prompt(player);
            }
        };
    },
};

export default evt;
