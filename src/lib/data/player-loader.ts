/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import type Config from '../util/config';
import type SerializedPlayer from '../players/serialized-player';

export class PlayerLoader {
    public async loadPlayer(username: string, config: Config): Promise<SerializedPlayer | null> {
        const uri = path.join(config.getPath('data'), 'player', `${username}.json`);

        if (!fs.existsSync(uri)) {
            return null;
        }

        const player: string = await fs.readFile(uri, 'utf8');

        return JSON.parse(player) as SerializedPlayer;
    }

    public async savePlayer(username: string, data: SerializedPlayer, config: Config): Promise<void> {
        const uri = path.join(config.getPath('data'), 'player', `${username}.json`);

        await fs.writeFile(uri, data);
    }
}

export default PlayerLoader;
