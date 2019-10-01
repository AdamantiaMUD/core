import Account, {SerializedAccount} from './account';
import EntityLoader from '../data/entity-loader';

/**
 * Creates/loads accounts
 */
export class AccountManager {
    /* eslint-disable lines-between-class-members */
    private readonly accounts: Map<string, Account> = new Map();
    private loader: EntityLoader = null;
    /* eslint-enable lines-between-class-members */

    public setAccount(username: string, acc: Account): void {
        this.accounts.set(username, acc);
    }

    public getAccount(username: string): Account {
        return this.accounts.get(username);
    }

    public async loadAccount(username: string, force: boolean = false): Promise<Account> {
        if (this.accounts.has(username) && !force) {
            return Promise.resolve(this.getAccount(username));
        }

        if (!this.loader) {
            throw new Error('No entity loader configured for accounts');
        }

        const account = new Account();
        const data: SerializedAccount = await this.loader.fetch(username);

        account.restore(data);

        this.setAccount(username, account);

        return account;
    }

    public setLoader(loader: EntityLoader): void {
        this.loader = loader;
    }
}

export default AccountManager;
