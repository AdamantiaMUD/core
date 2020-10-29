import AccountLoader from '../data/account-loader';
import Account from './account';
import {hasValue} from '../util/functions';

import type GameStateData from '../game-state-data';
import type SerializedAccount from './serialized-account';

/**
 * Creates/loads accounts
 */
export class AccountManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _accounts: Map<string, Account> = new Map<string, Account>();
    private readonly _loader: AccountLoader = new AccountLoader();
    private readonly _state: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(state: GameStateData) {
        this._state = state;
    }

    public setAccount(username: string, acc: Account): void {
        this._accounts.set(username, acc);
    }

    public getAccount(username: string): Account | null {
        return this._accounts.get(username) ?? null;
    }

    public async loadAccount(username: string, force: boolean = false): Promise<Account | null> {
        if (this._accounts.has(username) && !force) {
            return Promise.resolve(this.getAccount(username) ?? null);
        }

        const data: SerializedAccount | null = await this._loader.loadAccount(username, this._state.config);

        if (!hasValue(data)) {
            throw new Error('That player name does not exist... how did we get here?');
        }

        const account = new Account();

        account.restore(data);

        this.setAccount(username, account);

        return account;
    }
}

export default AccountManager;
