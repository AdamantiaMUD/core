import type SimpleMap from '../util/simple-map';

export interface SerializedGameEntity extends SimpleMap {
    entityReference: string | null;
    metadata: SimpleMap | null;
}

export default SerializedGameEntity;
