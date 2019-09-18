export declare class BundleManager {
    public constructor(bundlePath: string, config: Config);

    public loadBundles(): Promise<void>;
}

export declare class Config {
    public get(key: string, fallback?: any): any;
    public load(data: any): void;
    public set(key: string, value: any): void;
}

export declare class Logger {
    public static error(msg: string, ...messages: string[]): void;
    public static log(msg: string, ...messages: string[]): void
    public static setFileLogging(uri: string): void;
    public static setLevel(level: string): void;
    public static verbose(msg: string, ...messages: string[]): void;
    public static warn(msg: string, ...messages: string[]): void;
}

export interface SimpleMap {
    [key: string]: any;
}
