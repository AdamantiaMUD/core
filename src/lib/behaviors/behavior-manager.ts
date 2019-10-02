// import EventManager from '../events/event-manager';
// import GameState from '../game-state';
// import {SimpleMap} from '../../../index';
//
// export type Behavior = (config: SimpleMap, ...args: any[]) => void;
//
// export interface BehaviorDefinition {
//     listeners: {
//         [key: string]: (state: GameState) => Behavior;
//     };
// }
//
// /**
//  * BehaviorManager keeps a map of BehaviorName:EventManager which is used
//  * during Item and NPC hydrate() methods to attach events
//  */
// export class BehaviorManager {
//     /* eslint-disable lines-between-class-members */
//     public behaviors: Map<string, EventManager> = new Map();
//     /* eslint-enable lines-between-class-members */
//
//     public addListener(behaviorName: string, event: string, listener: Function): void {
//         if (!this.behaviors.has(behaviorName)) {
//             this.behaviors.set(behaviorName, new EventManager());
//         }
//
//         this.behaviors.get(behaviorName).add(event, listener);
//     }
//
//     public get(name: string): EventManager {
//         return this.behaviors.get(name);
//     }
//
//     public has(name: string): boolean {
//         return this.behaviors.has(name);
//     }
// }
//
// export default BehaviorManager;
