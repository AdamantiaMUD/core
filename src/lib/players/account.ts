import bcrypt from 'bcryptjs';

import Data from '../util/data';
import Serializable from '../data/serializable';
import {SimpleMap} from '../../../index';

const hashPassword = (pass: string): string => {
    const salt = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(pass, salt);
};

/**
 * Representation of a player's account
 */
class Account implements Serializable {
    /* eslint-disable lines-between-class-members */
    public banned: boolean = false;
    public characters: {username: string; deleted: boolean}[] = [];
    public deleted: boolean = false;
    public metadata: SimpleMap = {};
    public username: string;

    private password: string;
    /* eslint-enable lines-between-class-members */

    public addCharacter(username: string): void {
        this.characters.push({
            username: username,
            deleted: false,
        });
    }

    /**
     * Set this account to banned
     * There is no un-ban because this can just be done by manually editing the account file
     */
    public ban(): void {
        this.banned = true;
        this.save();
    }

    public checkPassword(pass: string): boolean {
        return bcrypt.compareSync(pass, this.password);
    }

    /**
     * Set this account to deleted
     * There is no un-delete because this can just be done by manually editing the account file
     */
    public deleteAccount(): void {
        this.characters.forEach(char => this.deleteCharacter(char.username));
        this.deleted = true;
        this.save();
    }

    public deleteCharacter(name: string): void {
        const picked = this.characters.find(char => char.username === name);

        picked.deleted = true;
        this.save();
    }

    public getUsername(): string {
        return this.username;
    }

    public hasCharacter(name: string): boolean {
        return this.characters.find(char => char.username === name) !== undefined;
    }

    public restore(data: any): void {
        this.banned = data.banned;
        this.characters = data.characters;
        this.deleted = data.deleted;
        this.password = data.password;
        this.username = data.username;
        this.metadata = data.metadata;
    }

    public save(callback?: Function): void {
        Data.save(
            'account',
            this.username,
            this.serialize(),
            callback
        );
    }

    /**
     * Gather data from account object that will be persisted to disk
     */
    public serialize(): SimpleMap {
        const {
            username,
            characters,
            password,
            metadata,
            deleted,
            banned,
        } = this;

        return {
            username,
            characters,
            password,
            metadata,
            deleted,
            banned,
        };
    }

    public setPassword(pass: string): void {
        this.password = hashPassword(pass);
        this.save();
    }

    public undeleteCharacter(name: string): void {
        const picked = this.characters.find(char => char.username === name);

        picked.deleted = false;
        this.save();
    }
}

export default Account;
