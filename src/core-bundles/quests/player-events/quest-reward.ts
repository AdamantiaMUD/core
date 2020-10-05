import Player from '~/lib/players/player';
import {MudEventListener, MudEventListenerDefinition} from '~/lib/events/mud-event';
import {QuestRewardEvent, QuestRewardPayload} from '~/lib/quests/quest-events';

export const evt: MudEventListenerDefinition<QuestRewardPayload> = {
    name: QuestRewardEvent.getName(),
    listener: (): MudEventListener<QuestRewardPayload> => (player: Player, {reward}) => {
        /*
         * do stuff when the player receives a quest reward. Generally the Reward instance
         * will emit an event that will be handled elsewhere and display its own message
         * e.g., 'currency' or 'experience'. But if you want to handle that all in one
         * place instead, or you'd like to show some supplemental message you can do that here
         */
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ,
};

export default evt;
