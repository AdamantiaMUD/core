/* eslint-disable-next-line id-length */
import path from 'path';

import fs from 'fs-extra';

import type SerializedPlayer from '../players/serialized-player.js';
import type Config from '../util/config.js';

export class PlayerLoader {
    public async loadPlayer(
        username: string,
        config: Config
    ): Promise<SerializedPlayer | null> {
        const uri = path.join(
            config.getPath('data'),
            'player',
            `${username}.json`
        );

        if (!fs.existsSync(uri)) {
            return null;
        }

        const player: string = await fs.readFile(uri, 'utf8');

        return JSON.parse(player) as SerializedPlayer;
    }

    public async savePlayer(
        username: string,
        data: SerializedPlayer,
        config: Config
    ): Promise<void> {
        const uri = path.join(
            config.getPath('data'),
            'player',
            `${username}.json`
        );

        await fs.writeFile(uri, JSON.stringify(data, null, 4));
    }
}

export default PlayerLoader;
