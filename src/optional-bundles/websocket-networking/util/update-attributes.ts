import type Player from '../../../lib/players/player';

export const updateAttributes = (player: Player): void => {
    /*
     * example of sending player data to a websocket client. This data is not
     * sent to the default telnet socket
     */
    const attributes = {};

    for (const name of player.attributes.getAttributeNames()) {
        attributes[name] = {
            current: player.getAttribute(name),
            max: player.getMaxAttribute(name),
        };
    }

    player.socket?.command('sendData', 'attributes', attributes);
};

export default updateAttributes;
