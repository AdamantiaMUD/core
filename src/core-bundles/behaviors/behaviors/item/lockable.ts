import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';

/**
 * A behavior that indicates a container has some mechanism to lock and unlock
 * it. Requires the container to also have the closeable behavior.
 */
export const lockable: BehaviorDefinition = {
    listeners: {},
};

export default lockable;
