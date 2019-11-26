import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import WebsocketStream from '../../../optional-bundles/websocket-networking/lib/WebsocketStream';
import {CombatInvalidTargetError} from '../../../lib/combat/combat-errors';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '../../../lib/common/common-events';

const {prompt, sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerFactory<UpdateTickPayload> = {
    name: UpdateTickEvent.getName(),
    listener: (state: GameState): MudEventListener<UpdateTickPayload> => (player: Player) => {
        if (!player.combat.isFighting()) {
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
    },
};

export default evt;
