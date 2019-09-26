import EventEmitter from 'events';
import {CommanderStatic} from 'commander';

export declare class BundleManager {
    public constructor(state: GameState);

    public loadBundles(): Promise<void>;
}

export declare class Config {
    public get(key: string, fallback?: any): any;
    public load(data: any): void;
    public set(key: string, value: any): void;
}

export declare class EventManager {
    public events: Map<string, Set<Function>>;

    public add(name: string, listener: Function): void;
    public attach(emitter: EventEmitter, config?: any): void;
    public detach(emitter: EventEmitter, eventNames?: string | string[]): void;
    public get(name: string): Set<Function>;
}

export declare class GameServer extends EventEmitter {
    public shutdown(): void;
    public startup(commander: CommanderStatic): void;
}

export declare class GameState {
    public config: Config;
    public server: GameServer;
    public serverEventManager: EventManager;

    public constructor(config: Config);

    public attachServer(): void;
    public startServer(commander: CommanderStatic): void;
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
