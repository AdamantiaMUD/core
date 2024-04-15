/* eslint-disable-next-line id-length */
import path from 'path';

import fs from 'fs-extra';

import type SerializedAccount from '../players/serialized-account.js';
import type Config from '../util/config.js';

export class AccountLoader {
    public async loadAccount(accountName: string, config: Config): Promise<SerializedAccount | null> {
        const uri = path.join(config.getPath('data'), 'account', `${accountName}.json`);

        if (!fs.existsSync(uri)) {
            return null;
        }

        const player: string = await fs.readFile(uri, 'utf8');

        return JSON.parse(player) as SerializedAccount;
    }

    public async saveAccount(accountName: string, data: SerializedAccount, config: Config): Promise<void> {
        const uri = path.join(config.getPath('data'), 'account', `${accountName}.json`);

        await fs.writeFile(uri, JSON.stringify(data, null, 2));
    }
}

export default AccountLoader;
