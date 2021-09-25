import Broadcast from '../../../lib/communication/broadcast';
import WebsocketStream from '../../../optional-bundles/websocket-networking/lib/WebsocketStream';
import {CombatInvalidTargetError} from '../../../lib/combat/errors';
import {UpdateTickEvent} from '../../../lib/common/events';

import type GameStateData from '../../../lib/game-state-data';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {UpdateTickPayload} from '../../../lib/common/events';

const {prompt, sayAt} = Broadcast;

export const evt: MudEventListenerDefinition<[Player, UpdateTickPayload]> = {
    name: UpdateTickEvent.getName(),
    listener: (state: GameStateData): MudEventListener<[Player, UpdateTickPayload]> => (player: Player): void => {
        if (!player.combat.isFighting()) {
            return;
        }

        state.combat?.startRegeneration(state, player);

        let hadActions = false;

        try {
            hadActions = state.combat?.updateRound(state, player) ?? false;
        }
        catch (err: unknown) {
            if (err instanceof CombatInvalidTargetError) {
                sayAt(player, "You can't attack that target.");
            }
            else {
                throw err;
            }
        }

        if (!hadActions) {
            return;
        }

        // @TODO: figure out a better way of determining socket type. Maybe add a `type` field to the TransportSocket class and its subclasses?
        const isUsingWebsockets = player.socket instanceof WebsocketStream;

        // don't show the combat prompt to a websockets server
        if (!player.hasPrompt('combat') && !isUsingWebsockets) {
            player.addPrompt('combat', () => state.combat?.buildPrompt(player) ?? '');
        }

        sayAt(player, '');
        if (!isUsingWebsockets) {
            prompt(player);
        }
    },
};

export default evt;
