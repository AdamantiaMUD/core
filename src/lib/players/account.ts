import bcrypt from 'bcryptjs';

import Data from '../util/data.js';
import {hasValue} from '../util/functions.js';

import type CharacterBrief from './character-brief.js';
import type Serializable from '../data/serializable.js';
import type SerializedAccount from './serialized-account.js';
import type SimpleMap from '../util/simple-map.js';

const hashPassword = (pass: string): string => {
    const salt = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(pass, salt);
};

/**
 * Representation of a player's account
 */
export class Account implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public isBanned: boolean = false;
    public characters: CharacterBrief[] = [];
    public isDeleted: boolean = false;
    public metadata: SimpleMap = {};
    public username: string = '';

    private _password: string = '';
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public addCharacter(username: string): void {
        this.characters.push({
            username: username,
            isDeleted: false,
        });
    }

    /**
     * Set this account to banned
     * There is no un-ban because this can just be done by manually editing the account file
     */
    public ban(): void {
        this.isBanned = true;
        this.save();
    }

    public checkPassword(pass: string): boolean {
        return bcrypt.compareSync(pass, this._password);
    }

    /**
     * Set this account to deleted
     * There is no un-delete because this can just be done by manually editing the account file
     */
    public deleteAccount(): void {
        this.characters
            .forEach((char: CharacterBrief) => this.deleteCharacter(char.username));

        this.isDeleted = true;

        this.save();
    }

    public deleteCharacter(name: string): void {
        const picked = this.characters
            .find((char: CharacterBrief) => char.username === name);

        if (hasValue(picked)) {
            picked.isDeleted = true;
        }

        this.save();
    }

    public getUsername(): string {
        return this.username;
    }

    public hasCharacter(name: string): boolean {
        return this.characters
            .find((char: CharacterBrief) => char.username === name) !== undefined;
    }

    public restore(data: SerializedAccount): void {
        this.isBanned = data.isBanned;
        this.characters = data.characters;
        this.isDeleted = data.isDeleted;
        this._password = data.password;
        this.username = data.username;
        this.metadata = data.metadata;
    }

    public save(callback?: () => void): void {
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
    public serialize(): SerializedAccount {
        const {
            username,
            characters,
            _password,
            metadata,
            isDeleted,
            isBanned,
        } = this;

        return {
            username: username,
            characters: characters,
            password: _password,
            metadata: metadata,
            isDeleted: isDeleted,
            isBanned: isBanned,
        };
    }

    public setPassword(pass: string): void {
        this._password = hashPassword(pass);
        this.save();
    }

    public undeleteCharacter(name: string): void {
        const picked = this.characters
            .find((char: CharacterBrief) => char.username === name);

        if (hasValue(picked)) {
            picked.isDeleted = false;
        }

        this.save();
    }
}

export default Account;
