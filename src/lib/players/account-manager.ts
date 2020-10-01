import Account from './account';
import {hasValue} from '../util/functions';

import type EntityLoader from '../data/entity-loader';
import type {SerializedAccount} from './account';

/**
 * Creates/loads accounts
 */
export class AccountManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _accounts: Map<string, Account> = new Map<string, Account>();
    private _loader: EntityLoader | null = null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

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

        if (!hasValue(this._loader)) {
            throw new Error('No entity loader configured for accounts');
        }

        const account = new Account();
        const data: SerializedAccount = await this._loader.fetch(username);

        account.restore(data);

        this.setAccount(username, account);

        return account;
    }

    public setLoader(loader: EntityLoader): void {
        this._loader = loader;
    }
}

export default AccountManager;
