import BehaviorManager from './behavior-manager';
import EventManager from '../events/event-manager';

describe('BehaviorManager', () => {
    describe('#addListener', () => {
        it('should should add the listener to the specified behavior and event', () => {
            expect.assertions(1);

            const mgr = new BehaviorManager();
            const behavior = mgr.get('listen');

            mgr.addListener('listen', 'music', () => {});

            expect(behavior.get('music').size).toStrictEqual(1);
        });
    });

    describe('#get', () => {
        it('should return an empty event manager if the given behavior has no listeners', () => {
            expect.assertions(2);

            const mgr = new BehaviorManager();

            expect(mgr.get('missing')).toBeInstanceOf(EventManager);
            expect(mgr.get('missing').size).toStrictEqual(0);
        });

        it('should return an event manager with the expected number of listeners', () => {
            expect.assertions(2);

            const mgr = new BehaviorManager();

            mgr.addListener('present', 'give', () => {});

            expect(mgr.get('present')).toBeInstanceOf(EventManager);
            expect(mgr.get('present').size).toStrictEqual(1);
        });
    });

    describe('#has', () => {
        it('should return false if the given behavior is not found', () => {
            expect.assertions(1);

            const mgr = new BehaviorManager();

            expect(mgr.has('missing')).toStrictEqual(false);
        });

        it('should return true if the given behavior exists', () => {
            expect.assertions(1);

            const mgr = new BehaviorManager();

            mgr.addListener('present', 'give', () => {});

            expect(mgr.has('present')).toStrictEqual(true);
        });
    });
});
