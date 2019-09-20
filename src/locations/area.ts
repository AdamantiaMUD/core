import {SimpleMap} from '../../index';

export interface AreaDefinition {
    bundle: string;
    manifest: AreaManifest;
    rooms: any[];
}

export interface AreaManifest {
    metadata?: SimpleMap;
    name: string;
}

export class Area {
    public readonly name: string;
    public readonly bundle: string;

    private readonly _manifest: AreaManifest;

    private _metadata: SimpleMap;
    private _rooms: Map<string, any> = new Map();

    public constructor(bundle: string, name: string, manifest: AreaManifest) {
        this.bundle = bundle;
        this.name = name;

        this._manifest = manifest;
    }

    public get metadata(): SimpleMap {
        return this._metadata;
    }

    public get rooms(): Map<string, any> {
        return this._rooms;
    }
}

export default Area;
