import SimpleMap from '../util/simple-map';

export interface Serializable {
    serialize(): SimpleMap | SimpleMap[];
}

export default Serializable;
