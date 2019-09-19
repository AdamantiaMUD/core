import {SimpleMap} from '../../index';

export interface Serializable {
    serialize(): SimpleMap | SimpleMap[];
}

export default Serializable;
