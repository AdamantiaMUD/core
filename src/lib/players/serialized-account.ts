import type CharacterBrief from './character-brief';
import type SimpleMap from '../util/simple-map';

export interface SerializedAccount extends SimpleMap {
    username: string;
    characters: CharacterBrief[];
    password: string;
    metadata: SimpleMap;
    isDeleted: boolean;
    isBanned: boolean;
}

export default SerializedAccount;
